import { Component, Input, OnDestroy, Output, EventEmitter, OnInit } from '@angular/core';
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

import { animations } from '../../../animations';
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
import { GlobalState, StepType, getSearchVariables } from '../../../pages/multi-step-page/steps';

const DebounceTime = 200;

type HitWithOrigin = Hit & {
    provider: string;
    corpus: { name: string };
    componentDisplayName: string;
};

interface HiddenComponents {
    [componentId: string]: boolean;
}

interface HideSettings {
    [provider: string]: {
        [corpus: string]: {
            hiddenComponents: HiddenComponents;
        }
    };
}

type HidableHit = HitWithOrigin & { hidden: boolean };

@Component({
    animations,
    selector: 'grt-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent extends StepComponent<GlobalState> implements OnInit, OnDestroy {
    private treebankSelection: TreebankSelection;
    private xpathSubject = new BehaviorSubject<string>(undefined);
    private filterValuesSubject = new BehaviorSubject<FilterValues>({});

    /** The hits and their visibility status */
    public errors: { message: string, corpus: string }[];
    public hidden: HideSettings = {};
    public hiddenCount = 0;
    public filteredResults: HidableHit[] = [];
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
    private variableProperties: GlobalState['variableProperties'];

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
        const state$ = this.state$.pipe(
            debounceTime(1000),
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
        const metadataCounts$ = this.createMetadataCountsStream(state$, this.xpathSubject, filterValues$);

        // subscribed streams
        const metadataFilters$ = this.createMetadataFiltersStream(metadataProperties$, metadataCounts$);
        const results$ = this.createResultsStream(state$, this.xpathSubject, filterValues$);

        this.subscriptions = [
            state$.subscribe(state => {
                this.treebankSelection = state.selectedTreebanks;
                this.variableProperties = state.variableProperties;
            }),
            metadataFilters$.subscribe(filters => this.filters = filters),

            results$.subscribe(r => {
                if (typeof r === 'string') {
                    switch (r) {
                        case 'start': {
                            // info reset on selected treebanks changing (see below).
                            this.loading = true;
                            this.filteredResults = [];
                            this.errors = [];
                            this.hiddenCount = 0;
                            break;
                        }
                        case 'finish': {
                            this.loading = false;
                            break;
                        }
                    }
                } else {
                    switch (r.result.kind) {
                        case NotificationKind.COMPLETE: {
                            // treebank has finished loading
                            break;
                        }
                        case NotificationKind.ERROR: {
                            // treebank has errored out!
                            this.errors.push({
                                corpus: r.corpus.name,
                                message: r.result.error.message
                            });
                            break;
                        }
                        case NotificationKind.NEXT: {
                            // some new hits!
                            const [newHits, newHidden] = this.hideHits(r.result.value.hits);
                            this.filteredResults.push(...newHits);
                            this.hiddenCount += newHidden;
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
                result.corpus.name,
                result.component,
                result.database,
                result.fileId,
                result.nodeIds,
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
            ? getSearchVariables(
                this.parseService.extractVariables(this.xpath).variables,
                this.variableProperties)
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
        return [...new Set(this.filteredResults
            .filter(h => !h.hidden)
            .map(f => f.fileId) // extract names
            .sort())];
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
        if (!this.hidden) {
            this.hidden = {};
        }
        if (!this.hidden[provider]) {
            this.hidden[provider] = {};
        }
        const corpusInfo = this.hidden[provider][corpus];
        if (corpusInfo) {
            Object.keys(corpusInfo.hiddenComponents).forEach(comp => {
                corpusInfo.hiddenComponents[comp] = false;
            });
            components.forEach(comp => corpusInfo.hiddenComponents[comp] = true);
        } else {
            this.hidden[provider][corpus] = {
                hiddenComponents: components.reduce((dict, component) => {
                    dict[component] = true;
                    return dict;
                }, {} as HiddenComponents)
            };
        }

        [this.filteredResults, this.hiddenCount] = this.hideHits();
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
        state$: Observable<GlobalState>,
        xpath$: Observable<string>,
        filterValues$: Observable<FilterValue[]>
    ): Observable<MetadataValueCounts> {
        return observableCombineLatest(
            state$,
            xpath$,
            filterValues$
        )
            .pipe(
                debounceTime(DebounceTime),
                distinctUntilChanged(),
                switchMap(([state, xpath, filterValues]) =>
                    // TODO: change to stream-based approach, so we can cancel http requests?
                    // TODO: error handling, just ignore that metadata?
                    // would need to check if requests are actually cancelled in the angular http service

                    // get counts for all selected
                    Promise.all(state.selectedTreebanks.corpora.map(({ provider, corpus }) =>
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
        metadataFields$: Observable<TreebankMetadata[]>,
        metadataValues$: Observable<MetadataValueCounts>,
    ): Observable<Filter[]> {
        return combineLatest(
            metadataFields$,
            metadataValues$
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
        state$: Observable<GlobalState>,
        xpath$: Observable<string>,
        filterValue$: Observable<FilterValue[]>
    ) {
        return observableCombineLatest(
            state$,
            xpath$,
            filterValue$
        ).pipe(
            filter((values) => values.every(value => value != null)),
            debounceTime(DebounceTime),
            distinctUntilChanged(),
            switchMap(([state, xpath, filterValues]) => {
                // create a request for each treebank
                const resultStreams = this.resultsStreamService.stream(
                    xpath,
                    state.selectedTreebanks,
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
     * Mark the hits which are part of hidden components or banks and
     * return a count of the hidden hits.
     */
    private hideHits(hits: HitWithOrigin[] = this.filteredResults): [HidableHit[], number] {
        let count = 0;
        const marked = hits.map(result => {
            const hiddenCorpora = this.hidden && this.hidden[result.provider];
            const component = hiddenCorpora && hiddenCorpora[result.corpus.name];
            const hidden = component && component.hiddenComponents &&
                component.hiddenComponents[result.component];
            if (hidden) {
                count++;
            }
            return Object.assign({}, result, { hidden });
        });

        return [marked, count];
    }

    public getWarningMessage() {
        // Should never show warning
    }
}
