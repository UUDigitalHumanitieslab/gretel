import { Component, Input, OnDestroy, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SafeHtml } from '@angular/platform-browser';

import { combineLatest as observableCombineLatest, BehaviorSubject, Subscription, Observable, merge, combineLatest } from 'rxjs';
import {
    debounceTime,
    distinctUntilChanged,
    endWith,
    filter,
    flatMap,
    map,
    shareReplay,
    startWith,
    switchMap
} from 'rxjs/operators';

import { ValueEvent } from 'lassy-xpath/ng';
import { ClipboardService } from 'ngx-clipboard';

import {
    DownloadService,
    FilterByXPath,
    FilterValue,
    FilterValues,
    Hit,
    MetadataValueCounts,
    ResultsService,
    ResultsStreamService,
    StateService,
    TreebankSelectionService,
    ParseService
} from '../../../services/_index';
import { Filter } from '../../../modules/filters/filters.component';
import { TreebankMetadata, TreebankSelection } from '../../../treebank';
import { StepComponent } from '../step.component';
import { NotificationKind } from 'rxjs/internal/Notification';
import { GlobalState, StepType } from '../../../pages/multi-step-page/steps';

const DebounceTime = 200;

type HitWithOrigin = Hit & {
    provider: string;
    corpus: { name: string };
    componentDisplayName: string;
};

interface ResultsInfo {
    [provider: string]: {
        [corpus: string]: {
            hidden: boolean;
            loading: boolean;
            hits: HitWithOrigin[];
            error?: HttpErrorResponse;
            hiddenComponents: {
                [componentId: string]: boolean
            }
        }
    };
}

@Component({
    selector: 'grt-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent extends StepComponent<GlobalState> implements OnInit, OnDestroy {
    private treebankSelection: TreebankSelection;
    private xpathSubject = new BehaviorSubject<string>(undefined);
    private filterValuesSubject = new BehaviorSubject<FilterValues>({});

    /** The hits and their visibility status */
    public info: ResultsInfo = {};
    public hiddenHits = 0;
    public filteredResults: Hit[] = [];
    public stepType = StepType.Results;

    @Input('xpath')
    public set xpath(value: string) { this.xpathSubject.next(value); }
    public get xpath(): string { return this.xpathSubject.value; }
    @Output()
    public changeXpath = new EventEmitter<string>();

    @Input('filterValues')
    public set filterValues(v: FilterValues) {
        const values = Object.values(v);
        this.filterValuesSubject.next(v);
        this.filterXPaths = values.filter((val): val is FilterByXPath => val.type === 'xpath');
        this.activeFilterCount = values.length;
    }
    public get filterValues(): FilterValues { return this.filterValuesSubject.value; }
    @Output()
    public changeFilterValues = new EventEmitter<FilterValues>();


    @Input()
    public retrieveContext = false;
    @Output()
    public changeRetrieveContext = new EventEmitter<boolean>();


    @Input()
    public inputSentence: string = null;

    @Output()
    public prev = new EventEmitter();

    @Output()
    public next = new EventEmitter();

    public loading = true;
    public loadingDownload = false;

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
    public loadingTree = false;
    public treeSentence?: SafeHtml;

    public columns = [
        { field: 'number', header: '#', width: '5%' },
        { field: 'fileId', header: 'ID', width: '20%' },
        { field: 'componentDisplayName', header: 'Component', width: '20%' },
        { field: 'highlightedSentence', header: 'Sentence', width: 'fill' },
    ];

    private subscriptions: Subscription[];

    constructor(private downloadService: DownloadService,
        private clipboardService: ClipboardService,
        private resultsService: ResultsService,
        private resultsStreamService: ResultsStreamService,
        private treebankSelectionService: TreebankSelectionService,
        private parseService: ParseService,
        stateService: StateService<GlobalState>
    ) {
        super(stateService);
        this.changeValid = new EventEmitter();
    }

    ngOnInit() {
        super.ngOnInit();
        // intermediate streams
        const treebankSelections$ = this.state$.pipe(
            debounceTime(1000),
            map(v => v.selectedTreebanks),
            shareReplay(1), // this stream is used as input in multiple others, no need to re-run it for every subscription.
        );
        const filterValues$ = this.filterValuesSubject.pipe( // the user-selected values
            debounceTime(1000),
            map(v => Object.values(v)),
            shareReplay(1),
        );
        // the metadata properties for the selected treebanks
        const metadataProperties$ = this.createMetadataPropertiesStream();
        // the values for the properties
        const metadataCounts$ = this.createMetadataCountsStream(treebankSelections$, this.xpathSubject, filterValues$);

        // subscribed streams
        const metadataFilters$ = this.createMetadataFiltersStream(metadataProperties$, metadataCounts$);
        const results$ = this.createResultsStream(treebankSelections$, this.xpathSubject, filterValues$);

        this.subscriptions = [
            treebankSelections$.subscribe(treebankSelection => this.treebankSelection = treebankSelection),
            metadataFilters$.subscribe(filters => this.filters = filters),

            results$.subscribe(r => {
                if (typeof r === 'string') {
                    switch (r) {
                        case 'start': {
                            // info reset on selected treebanks changing (see below).
                            this.loading = true;
                            this.filteredResults = [];
                            this.info = {};
                            this.hiddenHits = 0;
                            break;
                        }
                        case 'finish': {
                            this.loading = false;
                            break;
                        }
                    }
                } else {
                    if (!this.info[r.provider]) {
                        this.info[r.provider] = {};
                    }
                    let info = this.info[r.provider][r.corpus.name];
                    if (!info) {
                        this.info[r.provider][r.corpus.name] = info = {
                            hidden: false,
                            hiddenComponents: {},
                            hits: [],
                            loading: true
                        };
                    }

                    switch (r.result.kind) {
                        case NotificationKind.COMPLETE: {
                            // treebank has finished loading
                            info.loading = false;
                            break;
                        }
                        case NotificationKind.ERROR: {
                            // treebank has errored out!
                            info.loading = false;
                            info.error = r.result.error;
                            break;
                        }
                        case NotificationKind.NEXT: {
                            // some new hits!
                            // i.hits.push(...r.result.value.hits);
                            if (!info.hidden) {
                                const filtered = info.hidden
                                    ? []
                                    : r.result.value.hits.filter(h => !info.hiddenComponents[h.component]);
                                this.filteredResults.push(...filtered);
                                this.hiddenHits += filtered.length - r.result.value.hits.length;
                            }
                            break;
                        }
                    }
                }
            }),
        ];
    }

    ngOnDestroy() {
        super.ngOnDestroy();

        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    /** Show a tree of the given xml file, needs to contact the server as the result might not contain the entire tree */
    async showTree(result: HitWithOrigin) {
        this.treeXml = undefined;
        this.loadingTree = true;
        this.treeSentence = result.highlightedSentence;

        try {
            const treeXml = await this.resultsService.highlightSentenceTree(
                result.provider,
                result.fileId,
                result.corpus.name,
                result.nodeIds,
                result.component
            );
            this.treeXml = treeXml;
        } catch (e) {
            this.treeSentence = undefined;
            this.treeXml = undefined;
            this.loadingTree = false;

            console.warn(`Error retrieving tree in ${result.provider}:${result.corpus}:${result.component}:${result.fileId}`);
        }

        this.loadingTree = false;
    }

    public deleteFilter(filterValue: FilterValue) {
        const { [filterValue.field]: _, ...updated } = this.filterValues;
        this.filterChange(updated);
    }

    public async downloadResults(includeNodeProperties: boolean) {
        const filterValues = Object.values(this.filterValuesSubject.value);
        const variables = includeNodeProperties
            ? this.parseService.extractVariables(this.xpath).variables
            : undefined;

        this.loadingDownload = true;
        const results = await Promise.all(
            this.treebankSelection.corpora.map(corpus =>
                this.resultsService.promiseAllResults(
                    this.xpath,
                    corpus.provider,
                    corpus.corpus.name,
                    corpus.corpus.components,
                    this.retrieveContext,
                    false,
                    filterValues,
                    variables).then(hits => ({
                        corpus: corpus,
                        hits
                    }))));

        const r = results.flatMap(corpusHits => ({
            xpath: this.xpath,
            components: corpusHits.corpus.corpus.components,
            provider: corpusHits.corpus.provider,
            corpus: corpusHits.corpus.corpus.name,
            hits: corpusHits.hits
        }));

        await this.downloadService.downloadResults(r, variables);
        this.loadingDownload = false;
    }

    public downloadXPath() {
        this.downloadService.downloadXPath(this.xpath);
    }


    public downloadFilelist() {
        const fileNames = this.getFileNames();
        this.downloadService.downloadFilelist(fileNames, 'filelist');
    }

    /**
     * Returns the unique file names from the filtered results sorted on name.
     */
    public getFileNames() {
        return Object.values(this.info)
            .flatMap(provider => Object.values(provider))
            .filter(c => !c.hidden) // filter hidden banks
            .flatMap(c => c.hits.filter(h => !c.hiddenComponents[h.component])) // extract hits, filter hidden components
            .map(c => c.fileId) // extract names
            .sort();
    }

    public copyXPath() {
        if (this.clipboardService.copyFromContent(this.xpath)) {
            this.xpathCopied = true;
            setTimeout(() => {
                this.xpathCopied = false;
            }, 5000);
        }
    }

    public hideComponents({ provider, corpus, components }: { provider: string, corpus: string, components: string[] }) {
        const c = this.info[provider][corpus];
        Object.keys(c.hiddenComponents).forEach(comp => {
            c.hiddenComponents[comp] = false;
        });
        components.forEach(comp => c.hiddenComponents[comp] = true);
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
            this.changeXpath.next(this.customXPath);
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

        this.changeXpath.next(this.customXPath);
    }

    public changeCustomXpath(valueEvent: ValueEvent) {
        this.validXPath = !valueEvent.error;
        if (this.validXPath) {
            this.customXPath = valueEvent.xpath;
        }
    }

    toggleContext() {
        this.changeRetrieveContext.emit(!this.retrieveContext);
    }

    // ----

    /** Extracts metadata fields from the selected treebanks */
    private createMetadataPropertiesStream(): Observable<TreebankMetadata[]> {
        return this.treebankSelectionService.state$.pipe(
            switchMap(selection => Promise.all(selection.corpora.map(corpus => corpus.corpus.treebank))),
            switchMap(treebanks => Promise.all(treebanks.map(t => t.details.metadata()))),
            flatMap(metadata => metadata));
    }

    /** Retrieves metadata counts based on selected banks and filters */
    private createMetadataCountsStream(
        banksInput: Observable<TreebankSelection>,
        xpathInput: Observable<string>,
        filterValueInput: Observable<FilterValue[]>
    ): Observable<MetadataValueCounts> {
        return observableCombineLatest(
            banksInput,
            xpathInput,
            filterValueInput
        )
            .pipe(
                debounceTime(DebounceTime),
                distinctUntilChanged(),
                switchMap(([banks, xpath, filterValues]) =>
                    // TODO: change to stream-based approach, so we can cancel http requests?
                    // TODO: error handling, just ignore that metadata?
                    // would need to check if requests are actually cancelled in the angular http service

                    // get counts for all selected
                    Promise.all(banks.corpora.map(({ provider, corpus }) =>
                        this.resultsService.metadataCounts(
                            xpath,
                            provider,
                            corpus.name,
                            corpus.components,
                            filterValues
                        ).catch((): MetadataValueCounts => {
                            return {};
                        }))
                    )
                        // deep merge all results into a single object
                        .then((c: MetadataValueCounts[]) => {
                            return c.reduce<MetadataValueCounts>((counts, cur) => {
                                Object.keys(cur)
                                    .forEach(fieldName => {
                                        const field = counts[fieldName] = counts[fieldName] || {};
                                        Object.entries(cur[fieldName])
                                            .forEach(([metadataValue, valueCount]) => {
                                                field[metadataValue] = (field[metadataValue] || 0) + valueCount;
                                            });
                                    });

                                return counts;
                            }, {});
                        })
                ),
            );
    }

    /** Transforms metadata fields along with their values into filter definitions */
    private createMetadataFiltersStream(
        metadataFieldsInput: Observable<TreebankMetadata[]>,
        metadataValuesInput: Observable<MetadataValueCounts>,
    ): Observable<Filter[]> {
        return combineLatest(
            metadataFieldsInput,
            metadataValuesInput
        )
            .pipe(
                debounceTime(100), // lots of values bouncing around during initialization
                map(([fields, counts]) => {
                    return fields
                        .filter(field => field.show)
                        .map<Filter>(item => {
                            const options: string[] = [];
                            if (item.field in counts) {
                                for (const key of Object.keys(counts[item.field])) {
                                    // TODO: show the frequency (the data it right here now!)
                                    options.push(key);
                                }
                            }

                            // use a dropdown instead of checkboxes when there
                            // are too many options
                            if (item.facet === 'checkbox' && options.length > 8) {
                                item.facet = 'dropdown';
                            }

                            return {
                                field: item.field,
                                dataType: item.type,
                                filterType: item.facet,
                                minValue: item.minValue,
                                maxValue: item.maxValue,
                                options
                            };
                        });
                })
            );
    }

    /**
     * Gets up-to-date results for all selected treebanks
     *
     * Three types of values are emitted:
     *  'start': indicates a search/new result set is being started
     *  'finish': all treebanks finished searching
     *  @type {Notification} either a set of results, a finished message, or an error message within a selected treebank
     */
    private createResultsStream(
        treebankSelectionInput: Observable<TreebankSelection>,
        xpathInput: Observable<string>,
        filterValueInput: Observable<FilterValue[]>
    ) {
        return observableCombineLatest(
            treebankSelectionInput,
            xpathInput,
            filterValueInput
        ).pipe(
            filter((values) => values.every(value => value != null)),
            debounceTime(DebounceTime),
            distinctUntilChanged(),
            switchMap(([selectedTreebanks, xpath, filterValues]) => {
                // create a request for each treebank
                const resultStreams = this.resultsStreamService.stream(
                    xpath,
                    selectedTreebanks,
                    filterValues,
                    this.retrieveContext);

                // join all results, and wrap the entire sequence in a start and end message so
                // we know what's happening and can update spinners etc.
                return merge(...resultStreams).pipe(
                    startWith('start'),
                    endWith('finish'),
                );
            }),
        );
    }

    /**
     * Filter out the hits which are part of hidden components or banks and update the hiddenHits counter
     */
    private filterHits() {
        this.hiddenHits = 0;
        this.filteredResults =
            Object.values(this.info)
                .flatMap(provider => Object.values(provider))
                .filter(corpus => {
                    if (corpus.hidden) {
                        this.hiddenHits += corpus.hits.length;
                    }
                    return !corpus.hidden;
                })
                .flatMap(q => {
                    const filtered = q.hits.filter(h => !q.hiddenComponents[h.component]);
                    this.hiddenHits += q.hits.length - filtered.length;
                    return filtered;
                });
    }

    public getWarningMessage() {
        // Should never show warning
    }
}
