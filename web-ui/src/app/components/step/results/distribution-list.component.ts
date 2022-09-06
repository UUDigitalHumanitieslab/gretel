import { Component, Output, OnInit, OnDestroy, EventEmitter, Input, SimpleChanges, OnChanges } from '@angular/core';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { merge, from, Subscription, combineLatest, Notification } from 'rxjs';
import { map, switchMap, materialize, startWith, endWith, distinctUntilChanged } from 'rxjs/operators';

import { DownloadService, ResultCount, ResultsService, StateService, TreebankCount } from '../../../services/_index';
import { Treebank, TreebankComponent, TreebankSelection, FuzzyNumber } from '../../../treebank';
import { GlobalState } from '../../../pages/multi-step-page/steps';
import { NotificationKind } from './notification-kind';
interface ComponentState {
    title: string;
    hidden: boolean;
    sentenceCount: string;
    hits?: number;
    percentage?: number;
}

@Component({
    selector: 'grt-distribution-list',
    templateUrl: './distribution-list.component.html',
    styleUrls: ['./distribution-list.component.scss']
})
export class DistributionListComponent implements OnInit, OnDestroy, OnChanges {
    faDownload = faDownload;

    @Output()
    public hidingComponents = new EventEmitter<{
        provider: string,
        corpus: string,
        components: string[]
    }>();

    public loading = true;

    public state: {
        [provider: string]: {
            [corpus: string]: {
                hidden: boolean;
                sentenceCount: string;
                hits?: number;
                error?: Error;
                loading: boolean;
                components: {
                    [componentId: string]: ComponentState;
                };
            };
        };
    } = {};

    @Input()
    public incomingCounts: {
        [provider: string]: {
            [corpus: string]: [ResultCount]
        }
    } = {};

    @Input()
    public changes = 0;

    public totalHits = 0;
    public totalSentences = '?';

    private subscriptions: Subscription[] = [];

    constructor(
        private downloadService: DownloadService,
        private resultsService: ResultsService,
        private stateService: StateService<GlobalState>) {
    }

    ngOnInit() {
        const components$ = this.stateService.state$.pipe(
            map(state => ({
                selectedTreebanks: state.selectedTreebanks,
                xpath: state.xpath
            })),
            distinctUntilChanged((prev, curr) =>
                prev.xpath === curr.xpath &&
                prev.selectedTreebanks.equals(curr.selectedTreebanks)),
            switchMap(async state => {
                const components = await this.getComponents(state.selectedTreebanks);
                return {
                    components: components.map(x => ({
                        bank: x.bank,
                        components: x.components.filter(c => !c.disabled)
                    })).filter(x => x.components.length > 0),
                    xpath: state.xpath
                };
            }));
        const totals$ = components$.pipe(
            switchMap(({ components, xpath }) => this.getTotals(components, xpath)));

        const combined$ = combineLatest(components$, totals$);

        this.subscriptions = [
            combined$.subscribe(([components, totals]) => {
                if (typeof totals === 'string') {
                    switch (totals) {
                        case 'start': {
                            this.recreateState(components.components);
                            this.totalHits = 0;
                            this.loading = true;
                            break;
                        }
                        case 'finish': {
                            this.loading = false;
                        }
                    }
                } else {
                    this.addTotals(totals.bank, totals.result);
                }
            }),
        ];
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }

    ngOnChanges(changes: SimpleChanges) {
        console.log('Something changed!');
        let totalHits = 0;
        for (const provider of Object.getOwnPropertyNames(this.incomingCounts)) {
            for (const treebank of Object.getOwnPropertyNames(this.incomingCounts[provider])) {
                let treebankhits = 0;
                for (const resultcount of this.incomingCounts[provider][treebank]) {
                    treebankhits += resultcount.numberOfResults;
                    this.state[provider][treebank].components[resultcount.component].hits = resultcount.numberOfResults;
                    this.state[provider][treebank].components[resultcount.component].percentage = resultcount.percentage;
                }
                this.state[provider][treebank].hits = treebankhits;
                totalHits += treebankhits;
                //this.state[provider][treebank]
            }
        }
        this.totalHits = totalHits;
    }

    private recreateState(entries: Array<{ bank: Treebank, components: TreebankComponent[] }>) {
        this.state = {};
        const totalSentenceCount = new FuzzyNumber(0);

        entries.forEach(({ bank, components }) => {
            const p = this.state[bank.provider] =
                this.state[bank.provider] ||
                {};

            const b = p[bank.id] =
                p[bank.id] || {
                    components: {},
                    error: undefined,
                    hidden: false,
                    loading: true,
                    hits: undefined,
                    sentenceCount: components
                        .reduce((count, comp) => {
                            count.add(comp.sentenceCount);
                            return count;
                        }, new FuzzyNumber(0))
                        .toLocaleString()
                };

            components.forEach(c => {
                b.components[c.id] = {
                    hidden: false,
                    hits: undefined,
                    sentenceCount: c.sentenceCount.toLocaleString(),
                    title: c.title
                };

                totalSentenceCount.add(c.sentenceCount);
            });
        });

        this.totalSentences = totalSentenceCount.toLocaleString();
    }

    private addTotals(bank: Treebank, t: Notification<TreebankCount[]>) {
        switch (t.kind) {
            case NotificationKind.COMPLETE: {
                this.state[bank.provider][bank.id].loading = false;
                return;
            }
            case NotificationKind.ERROR: {
                this.state[bank.provider][bank.id].error = t.error;
                this.state[bank.provider][bank.id].loading = false;
                return;
            }
            case NotificationKind.NEXT: {
                const b = this.state[bank.provider][bank.id];
                t.value.forEach(v => {
                    b.components[v.componentId].hits = v.count;
                    b.hits = (b.hits || 0) + v.count;
                    this.totalHits += v.count;
                });
            }
        }
    }

    /** Return a more easily usable set of all selected treebanks/components */
    private async getComponents(selection: TreebankSelection): Promise<{
        bank: Treebank,
        components: TreebankComponent[]
    }[]> {
        const selectedCorpora = selection.corpora.map(corpus => corpus.corpus);
        return Promise.all(selectedCorpora.map(async (selectedCorpus) => {
            const treebank = await selectedCorpus.treebank;
            const components = await treebank.details.components();
            return {
                bank: treebank,
                components: selectedCorpus.components.map(c => components[c])
            };
        }));
    }

    private getTotals(
        banks: { bank: Treebank, components: TreebankComponent[] }[],
        xpath: string
    ) {
        // create a request for each bank
        const requests = banks.map(({ bank, components }) =>
            // turn response promise into stream again
            from(this.resultsService.treebankCounts(
                xpath,
                bank.provider,
                bank.id,
                components.map(c => c.id),
            ))
                .pipe(
                    // transform errors for this bank into normal notification
                    // to prevent merged stream from dying if one bank fails
                    materialize(),
                    // results don't include the origin bank, so re-attach the bank so we know where they originated
                    map(result => ({
                        result,
                        bank
                    }))
                )
        );

        return merge(...requests).pipe(
            startWith('start'),
            endWith('finish')
        );
    }

    public toggleComponent(provider: string, corpus: string, componentId: string, hidden: boolean) {
        const c = this.state[provider][corpus];
        c.components[componentId].hidden = hidden;
        c.hidden = Object.values(c.components).every(comp => comp.hidden);

        this.emitHiddenComponents();
    }

    public toggleAllComponents(provider: string, corpus: string, hidden: boolean) {
        const c = this.state[provider][corpus];
        Object.values(c.components).forEach(comp => comp.hidden = hidden);
        c.hidden = hidden;

        this.emitHiddenComponents();
    }

    public download() {
        function makeCounts(provider: string, corpus: string, comps: Array<ComponentState>) {
            return comps.map(c => ({
                provider,
                corpus,
                component: c.title,
                hits: c.hits,
                sentences: c.sentenceCount
            }));
        }

        const counts =
            Object.entries(this.state).flatMap(([provider, banks]) =>
                Object.entries(banks).flatMap(([corpus, info]) =>
                    makeCounts(
                        provider,
                        corpus,
                        Object.values(info.components)
                    )
                )
            );

        this.downloadService.downloadDistributionList(counts);
    }

    private emitHiddenComponents() {
        Object.entries(this.state)
            .forEach(([provider, banks]) => {
                Object.entries(banks)
                    .forEach(([name, bank]) => {
                        this.hidingComponents.emit({
                            provider,
                            corpus: name,
                            components: bank.hidden ? Object.keys(bank.components) :
                                Object.entries(bank.components)
                                    .filter(([, comp]) => comp.hidden)
                                    .map(([id]) => id)
                        });
                    });
            });
    }
}

