import { Component, Input, OnDestroy, Output, EventEmitter, SimpleChanges  } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';

import { combineLatest as observableCombineLatest, merge, BehaviorSubject, Subscription, Observable } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged, switchMap, map, reduce } from 'rxjs/operators';

import { ValueEvent } from 'lassy-xpath/ng';
import { ClipboardService } from 'ngx-clipboard';

import {
    DownloadService,
    FilterValue,
    Hit,
    MetadataValueCounts,
    ResultsService,
    TreebankService,
    mapTreebanksToSelectionSettings,
    SearchResults,
    FilterValues,
    FilterByXPath
} from '../../../services/_index';
import { Filter } from '../../filters/filters.component';
import { TreebankMetadata, Treebank, FuzzyNumber } from '../../../treebank';
import { StepComponent } from '../step.component';
const DebounceTime = 200;

@Component({
    selector: 'grt-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent extends StepComponent implements OnDestroy {
    private xpathSubject = new BehaviorSubject<string>(undefined);
    private metadataValueCountsSubject = new BehaviorSubject<MetadataValueCounts[]>([]);
    // private metadataSubject = new BehaviorSubject<TreebankMetadata[]>([]);
    private filterValuesSubject = new BehaviorSubject<FilterValue[]>([]);

    @Input('xpath')
    public set xpath(value: string) { this.xpathSubject.next(value); }
    public get xpath(): string { return this.xpathSubject.value; }

    @Input()
    public filterValues: FilterValues = {};

    @Input()
    public retrieveContext = false;

    @Input()
    public inputSentence: string = null;


    @Output()
    public xpathChange = new EventEmitter<string>();

    @Output()
    public changeRetrieveContext = new EventEmitter<boolean>();

    @Output()
    public changeFilterValues = new EventEmitter<FilterValues>();

    @Output()
    public prev = new EventEmitter();

    @Output()
    public next = new EventEmitter();

    public loading = true;

    public xpathCopied = false;
    public customXPath: string;
    public validXPath = true;
    public isModifyingXPath = false;
    public activeFilterCount = 0;

    public filters: Filter[] = [];

    /**
     * Filters on node properties created in the analysis component
     */
    public filterXPaths: FilterByXPath[] = [];

    // Xml tree displaying (of a result)
    public treeXml?: string;
    public treeSentence?: SafeHtml;

    public columns = [
        { field: 'number', header: '#', width: '5%' },
        { field: 'fileId', header: 'ID', width: '20%' },
        { field: 'component', header: 'Component', width: '20%' },
        { field: 'highlightedSentence', header: 'Sentence', width: 'fill' },
    ];

    private subscriptions: Subscription[];

    /** How many hits have been found so far for each component, and has the component finished being searched yet */
    public resultSummary: ResultSummary = {};
    public totalSentences: FuzzyNumber = new FuzzyNumber('?');
    public totalHits: 0;
    public filteredResults: Hit[] = [];

    constructor(private downloadService: DownloadService,
        private clipboardService: ClipboardService,
        private resultsService: ResultsService,
        private treebankService: TreebankService
    ) {
        super();

        this.subscriptions = [
            this.liveMetadataCounts(),
            // this.liveMetadataProperties(),
            this.liveFilters(),
            this.liveResults(),
        ];

        this.changeValid = new EventEmitter();
    }

    ngOnChanges(changes: SimpleChanges) {
        const filterValuesChange = changes['filterValues'];
        if (filterValuesChange && (filterValuesChange.firstChange ||
            filterValuesChange.previousValue !== filterValuesChange.currentValue)) {
            const values = Object.values(this.filterValues);
            this.filterValuesSubject.next(values);
            this.filterXPaths = values.filter(
                (val): val is FilterByXPath => val.type === 'xpath');
            this.activeFilterCount = values.length;
        }
    }

    ngOnDestroy() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    /**
     * Show a tree of the given xml file
     */
    showTree(result: Hit) {
        this.treeSentence = result.highlightedSentence;
        this.treeXml = this.resultsService.highlightSentenceTree(result.treeXml, result.nodeIds);
    }

    public deleteFilter(filterValue: FilterValue) {
        const { [filterValue.field]: _, ...updated } = this.filterValues;
        this.filterChange(updated);
    }

    public downloadResults() {
        const r = [] as Array<{
            xpath: string,
            components: string[],
            provider: string,
            corpus: string,
            hits: Hit[]
        }>

        Object.entries(this.resultSummary).forEach(([provider, treebanks]) => {
            Object.entries(treebanks).forEach(([corpus, settings]) => {
                r.push({
                    components: Object.keys(settings.components),
                    corpus,
                    hits: settings.hits,
                    provider,
                    xpath: this.xpath
                })
            })
        });

        this.downloadService.downloadResults(r);
    }

    public downloadXPath() {
        this.downloadService.downloadXPath(this.xpath);
    }


    public downloadFilelist() {
        const fileNames = this.getFileNames();
        this.downloadService.downloadFilelist(fileNames, 'filelist');
    }

    public downloadDistributionList() {
        let values = [] as Array<{
            provider: string;
            corpus: string;
            component: string;
            hits: number;
            sentences: string;
        }>;

        Object.entries(this.resultSummary).forEach(([provider, banks]) =>
            Object.entries(banks).forEach(([corpus, corpusData]) => {
                Object.entries(corpusData.components).forEach(([component, componentData]) => {
                    values.push({
                        component,
                        corpus,
                        provider,
                        hits: componentData.hits,
                        sentences: ''+componentData.sentences
                    })
                })
            })
        )

        this.downloadService.downloadDistributionList(values);
    }

    /**
     * Returns the unique file names from the filtered results sorted on name.
     */
    public getFileNames() {
        const allNames = new Set(this.filteredResults.map((result) => result.fileId));
        return Array.from(allNames).sort();
    }

    public copyXPath() {
        if (this.clipboardService.copyFromContent(this.xpath)) {
            this.xpathCopied = true;
            setTimeout(() => {
                this.xpathCopied = false;
            }, 5000);
        }
    }

    public toggleCorpus(provider: string, corpus: string) {
        const settings = this.resultSummary[provider][corpus];
        settings.show = !settings.show;
        this.filterHits();
    }

    public toggleComponent(provider: string, corpus: string, component: string) {
        const settings = this.resultSummary[provider][corpus];
        settings.components[component].show = !settings.components[component].show;
        settings.allComponentsSelected = Object.values(settings.components).every(c => c.show);
        this.filterHits();
    }

    public toggleAllComponents(provider: string, corpus: string) {
        const settings = this.resultSummary[provider][corpus];

        const show = settings.allComponentsSelected = !settings.allComponentsSelected;
        Object.values(settings.components).forEach(c => c.show = show);
        this.filterHits();
    }

    public filterChange(filterValues: FilterValues) {
        this.changeFilterValues.next(filterValues);
    }

    public print() {
        (window as any).print();
    }

    public editXPath() {
        this.isModifyingXPath = true;
    }

    public updateXPath() {
        if (this.validXPath) {
            this.xpathChange.next(this.customXPath);
            this.isModifyingXPath = false;
        }
    }

    public resetXPath() {
        this.isModifyingXPath = false;
    }

    public addFiltersXPath() {
        this.customXPath = this.resultsService.createFilteredQuery(
            this.xpath || this.customXPath,
            Object.values(this.filterValues));
        this.filterChange({});

        this.xpathChange.next(this.customXPath);
    }

    public customXPathChanged(valueEvent: ValueEvent) {
        this.validXPath = !valueEvent.error;
        if (this.validXPath) {
            this.customXPath = valueEvent.xpath;
        }
    }

    toggleContext() {
        this.changeRetrieveContext.emit(!this.retrieveContext);
    }

    /**
     * Get the counts for the metadata
     */
    private liveMetadataCounts() {
        // TODO: handle when filters have been applied (part of #36)
        return observableCombineLatest(
            this.xpathSubject,
            this.treebankService.treebanks.pipe(map(v => mapTreebanksToSelectionSettings(v.state)))
        )
        .pipe(
            filter((values) => values.every(value => value != null)),
            debounceTime(DebounceTime),
            distinctUntilChanged(),
            switchMap(([xpath, selectedTreebanks]) => Promise.all(
                selectedTreebanks.map(tb =>
                    this.resultsService.metadataCounts(xpath, tb.provider, tb.corpus, tb.components)
                )
            ))
        )
        .subscribe(counts => this.metadataValueCountsSubject.next(counts));
    }

    /**
     * Get the filters
     */
    private liveFilters() {
        // Join all known metadadata
        return observableCombineLatest(
            this.treebankService.treebanks.pipe(
                map(v =>
                    Object.values(v.state)
                    .flatMap(provider => Object.values(provider))
                    .flatMap(bank => bank.metadata)
                ),
            ),
            this.metadataValueCountsSubject.pipe(
               map(v => v.reduce(Object.assign, {}) as MetadataValueCounts)
            )
        )
        .subscribe(([metadata, counts]) => {
            const filters: Filter[] = [];

            for (const item of metadata) {
                if (item.show) {
                    const options: string[] = [];
                    if (item.field in counts) {
                    for (const key of Object.keys(counts[item.field])) { // string indexing an array
                            // TODO: show the frequency (the data it right here now!)
                            options.push(key);
                        }
                    }

                    if (item.facet === 'checkbox' && options.length > 8) {
                        // use a dropdown instead of checkboxes when there
                        // are too many options
                        item.facet = 'dropdown';
                    }

                    filters.push({
                        field: item.field,
                        dataType: item.type,
                        filterType: item.facet,
                        minValue: item.minValue,
                        maxValue: item.maxValue,
                        options
                    });
                }
            }
            this.filters = filters;
        });
    }

    /**
     * Get the results
     */
    private liveResults() {
        return observableCombineLatest(
            this.treebankService.treebanks.pipe(map(v => v.state)),
            this.xpathSubject,
            this.filterValuesSubject
        ).pipe(
            filter((values) => values.every(value => value != null)),
            debounceTime(DebounceTime),
            distinctUntilChanged(),
            switchMap(([treebanks, xpath, filterValues]) => {
                const selectedTreebanks = mapTreebanksToSelectionSettings(treebanks);

                this.filteredResults = [];

                this.loading = true;
                this.totalSentences = new FuzzyNumber(0);
                this.totalHits = 0;

                this.resultSummary = {};
                const $results = [] as Observable<{results: SearchResults, treebank: Treebank}>[];

                selectedTreebanks.forEach(({provider, corpus, components}) => {
                    const treebankData = treebanks[provider][corpus];
                    const selectedComponents = treebankData.componentGroups.flatMap(g => Object.values(g.components)).filter(c => c.selected);

                    if (!this.resultSummary[provider]) { this.resultSummary[provider] = {}};
                    this.resultSummary[provider][corpus] = {
                        show: true,
                        hits: [],
                        // filteredHits: [],
                        allComponentsSelected: true,
                        // one entry per selected component
                        totalSentences: selectedComponents.reduce((acc, c) => {acc.add(c.sentenceCount); return acc;}, new FuzzyNumber(0)).toString(),
                        components: selectedComponents.reduce((acc, component) => {
                            acc[component.id] = {
                                show: true,
                                hits: 0,
                                sentences: component.sentenceCount
                            }
                            return acc;
                        }, {} as ResultSummary[string][string]['components']),
                    }

                    $results.push(
                        this.resultsService.getAllResults(
                            xpath,
                            provider,
                            corpus,
                            components,
                            this.retrieveContext,
                            false,
                            filterValues,
                            []
                        )
                        .pipe(map(results => ({
                            results,
                            treebank: treebankData.treebank,
                        })))
                    );

                    selectedComponents.forEach(c => this.totalSentences.add(c.sentenceCount));
                });

                // merge the observables (one for each treebank) into a single stream
                // TODO: error handling
                let combined = merge(...$results);
                combined.subscribe(
                    () => {},
                    () => {},
                    () => this.loading = false
                );
                return combined;
            })
        )
        .subscribe(
            ({results, treebank}) => {
                const treebankResults = this.resultSummary[treebank.provider][treebank.name];
                treebankResults.hits.push(...results.hits);
                this.totalHits += results.hits.length;

                results.hits.forEach(hit => {
                    const resultComponent = treebankResults.components[hit.component];
                    ++resultComponent.hits;
                    if (treebankResults.show && resultComponent.show) {
                        this.filteredResults.push(hit);
                    }
                })
            },
            // (error) => {
            //     console.log('received error from results-service?', error);
            // },
            // () => {
            //     console.log('received all results from results-service?');
            //     this.loading = false;
            // }
        )
    }

    /**
     * Filter out the hits which are part of hidden components
     * @param hits
     */
    private filterHits() {
        const filteredResults: Hit[] = [];
        Object.values(this.resultSummary).flatMap(v => Object.values(v))
        .filter(tb => tb.show)
        .forEach(tb => {
            filteredResults.push(...tb.hits.filter(hit => tb.components[hit.component].show));
        })
        this.filteredResults = filteredResults;
    }

    public getValidationMessage() {
        // Should never show warning
    }

    updateValidity() {
    }
}

type ResultSummary = {
    [provider: string]: {
        [corpus: string]: {
            show: boolean;
            allComponentsSelected: boolean;
            hits: Hit[];
            totalSentences: string;
            components: {
                [componentId: string]: {
                    hits: number;
                    sentences: number|'?';
                    show: boolean;
                }
            }
        }
    }
}
