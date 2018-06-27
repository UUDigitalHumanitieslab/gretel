import { Component, Input, OnDestroy, Output, EventEmitter } from '@angular/core';

import { combineLatest as observableCombineLatest, BehaviorSubject, Subscription } from 'rxjs';
import { tap, filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ValueEvent } from 'lassy-xpath/ng';
import { ClipboardService } from 'ngx-clipboard';

import {
    DownloadService,
    FilterValue,
    Hit,
    MetadataValueCounts,
    ResultsService,
    TreebankService
} from '../../../services/_index';
import { Filter } from '../../filters/filters.component';
import { TreebankMetadata } from '../../../treebank';
import { StepComponent } from "../step.component";

const DebounceTime = 200;

@Component({
    selector: 'grt-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent extends StepComponent implements OnDestroy {
    private corpusSubject = new BehaviorSubject<string>(undefined);
    private componentsSubject = new BehaviorSubject<string[]>([]);
    private xpathSubject = new BehaviorSubject<string>(undefined);
    private metadataValueCountsSubject = new BehaviorSubject<MetadataValueCounts>({});
    private metadataSubject = new BehaviorSubject<TreebankMetadata[]>([]);
    private filterValuesSubject = new BehaviorSubject<FilterValue[]>([]);

    /**
     * The components unchecked by the user, the sub-results of these components should be filtered out
     */
    private hiddenComponents: { [component: string]: true } = {};


    @Input('corpus')
    public set corpus(value: string) {
        this.corpusSubject.next(value);
    }

    public get corpus() {
        return this.corpusSubject.value;
    }

    @Input('components')
    public set components(value: string[]) {
        this.componentsSubject.next(value);
    }

    public get components() {
        return this.componentsSubject.value;
    }

    @Input('xpath')
    public set xpath(value: string) {
        this.xpathSubject.next(value);
    }

    public get xpath() {
        return this.xpathSubject.value;
    }

    @Input()
    public retrieveContext: boolean = false;

    @Input()
    public inputSentence: string = null;

    @Output()
    public xpathChange = new EventEmitter<string>();

    @Output()
    public onChangeRetrieveContext = new EventEmitter<boolean>();

    public loading: boolean = true;

    public treeXml?: string;
    public filteredResults: Hit[] = [];
    public xpathCopied = false;
    public customXPath: string;
    public validXPath: boolean = true;
    public isModifyingXPath: boolean = false;

    public filters: Filter[] = [];

    public columns = [
        { field: 'number', header: '#', width: '5%' },
        { field: 'fileId', header: 'ID', width: '20%' },
        { field: 'component', header: 'Component', width: '20%' },
        { field: 'highlightedSentence', header: 'Sentence', width: 'fill' },
    ];

    private results: Hit[] = [];
    private subscriptions: Subscription[];

    constructor(private downloadService: DownloadService,
        private clipboardService: ClipboardService,
        private resultsService: ResultsService,
        private treebankService: TreebankService) {
        super();
        this.subscriptions = [
            this.liveMetadataCounts(),
            this.liveMetadataProperties(),
            this.liveFilters(),
            this.liveResults()
        ];

        this.onChangeValid = new EventEmitter();
    }

    ngOnDestroy() {
        for (let subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    /**
     * Show a tree of the given xml file
     * @param link to xml file
     */
    async showTree(result: Hit) {
        this.treeXml = undefined;
        this.treeXml = await this.resultsService.highlightSentenceTree(result.fileId, this.corpus, result.nodeIds);
    }

    public downloadResults() {
        this.downloadService.downloadResults(this.corpus, this.components, this.xpath, this.results);
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
        const allNames = new Set(this.filteredResults.map((result) => result.fileId));
        return Array.from(allNames).sort()
    }

    public copyXPath() {
        if (this.clipboardService.copyFromContent(this.xpath)) {
            this.xpathCopied = true;
            setTimeout(() => {
                this.xpathCopied = false;
            }, 5000);
        }
    }

    public hideComponents(components: string[] | undefined = undefined) {
        if (components !== undefined) {
            this.hiddenComponents = Object.assign({}, ...components.map(name => {
                return { [name]: true }
            }));
        }

        this.filteredResults = this.filterHits(this.results);
    }

    public filterChange(filterValues: FilterValue[]) {
        this.filterValuesSubject.next(filterValues);
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

    public customXPathChanged(valueEvent: ValueEvent) {
        this.validXPath = !valueEvent.error;
        if (this.validXPath) {
            this.customXPath = valueEvent.xpath;
        }
    }

    toggleContext() {
        this.onChangeRetrieveContext.emit(!this.retrieveContext);
    }

    /**
     * Get the counts for the metadata
     */
    private liveMetadataCounts() {
        // TODO: handle when filters have been applied (part of #36)
        return observableCombineLatest(this.xpathSubject, this.corpusSubject, this.componentsSubject).pipe(
            filter((values) => values.every(value => value !== undefined)),
            debounceTime(DebounceTime),
            distinctUntilChanged(),
            switchMap(([corpus, components, xpath]) =>
                this.resultsService.metadataCounts(corpus, components, xpath)))
            .subscribe(counts => {
                this.metadataValueCountsSubject.next(counts);
            });
    }

    /**
     * Get the metadata for the current corpus
     */
    private liveMetadataProperties() {
        return this.corpusSubject.pipe(filter(corpus => corpus !== undefined),
            distinctUntilChanged(),
            switchMap(corpus => this.treebankService.getMetadata(corpus)))
            .subscribe(metadata => this.metadataSubject.next(metadata));
    }

    /**
     * Get the filters
     */
    private liveFilters() {
        return observableCombineLatest(this.metadataSubject, this.metadataValueCountsSubject)
            .subscribe(([metadata, counts]) => {
                let filters: Filter[] = [];
                for (let filter of metadata) {
                    if (filter.show) {
                        let options: string[] = [];
                        if (filter.field in counts) {
                            for (let key of Object.keys(counts[filter.field])) {
                                // TODO: show the frequency (the data it right here now!)
                                options.push(key);
                            }
                        }
                        filters.push({
                            field: filter.field,
                            dataType: filter.type,
                            filterType: filter.facet,
                            minValue: filter.minValue,
                            maxValue: filter.maxValue,
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
        return observableCombineLatest(this.corpusSubject, this.componentsSubject, this.xpathSubject, this.filterValuesSubject).pipe(
            filter((values) => values.every(value => value !== undefined)),
            debounceTime(DebounceTime),
            distinctUntilChanged(),
            switchMap(([corpus, components, xpath, filterValues]) => {
                this.loading = true;
                this.results = [];
                this.filteredResults = [];
                return this.resultsService.getAllResults(
                    xpath,
                    corpus,
                    components,
                    this.retrieveContext,
                    false,
                    filterValues,
                    [],
                    () => {
                        this.loading = false;
                    });
            }),
            tap(results => {
                this.results.push(...results.hits);
                this.filteredResults.push(...this.filterHits(results.hits));
            }))
            .subscribe();
    }

    /**
     * Filter out the hits which are part of hidden components
     * @param hits
     */
    private filterHits(hits: Hit[]) {
        return hits.filter(hit => !this.hiddenComponents[hit.databaseId]);
    }

    getValidationMessage() {
        // Should never show warning
    }

    updateValidity() {
    }
}
