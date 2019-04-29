import { Component, Input, Output, SimpleChange, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { DownloadService, ResultsService, TreebankService, TreebankCount } from '../../../services/_index';
import { Observable, BehaviorSubject, merge, from, Subscription, combineLatest, Notification } from 'rxjs';
import { map, switchMap, materialize, startWith, endWith } from 'rxjs/operators';
import { Treebank, TreebankComponent, FuzzyNumber } from '../../../treebank';
import { NotificationKind } from 'rxjs/internal/Notification';


type ComponentInfo = {

};

@Component({
    selector: 'grt-distribution-list',
    templateUrl: './distribution-list.component.html',
    styleUrls: ['./distribution-list.component.scss']
})
export class DistributionListComponent implements OnInit, OnDestroy {
    @Input()
    public set xpath(v: string) { this.xpathSubject.next(v); }
    public get xpath(): string { return this.xpathSubject.value; }
    private xpathSubject = new BehaviorSubject<string>('');

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
                    [componentId: string]: {
                        title: string;
                        hidden: boolean;
                        sentenceCount: string;
                        hits?: number;
                    };
                };
            };
        };
    } = {};
    public totalHits = 0;
    public totalSentences = '?';

    private subscriptions: Subscription[] = [];

    constructor(
        private downloadService: DownloadService,
        private resultsService: ResultsService,
        private treebankService: TreebankService
    ) {
    }

    ngOnInit() {
        const components$ = this.createComponentsStream();
        const totals$ = this.createTotalsStream(components$, this.xpathSubject);
        const combined$ = combineLatest(components$, totals$);

        const recreateState = (entries: Array<{bank: Treebank, components: TreebankComponent[]}>) => {
            this.state = {};
            const totalSentenceCount = new FuzzyNumber(0);

            entries.forEach(({bank, components}) => {
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
        };

        const addTotals = (bank: Treebank, t: Notification<TreebankCount[]>) => {
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
                        b.components[v.databaseId].hits = v.count;
                        b.hits = (b.hits || 0) + v.count;
                        this.totalHits += v.count;
                    });
                }
            }
        };

        this.subscriptions = [
            combined$.subscribe(([components, totals]) => {
                if (typeof totals === 'string') {
                    switch (totals) {
                        case 'start': {
                            recreateState(components);
                            this.totalHits = 0;
                            this.loading = true;
                            break;
                        }
                        case 'finish': {
                            this.loading = false;
                        }
                    }
                } else {
                    addTotals(totals.bank, totals.result);
                }
            })
        ];
    }

    ngOnDestroy() {
        this.subscriptions.forEach(sub => sub.unsubscribe());
        this.subscriptions = [];
    }

    /** Return a more easily usable set of all selected treebanks/components */
    private createComponentsStream(): Observable<Array<{
        bank: Treebank,
        components: TreebankComponent[]
    }>> {
        return this.treebankService.treebanks.pipe(
            map(treebanks => {
                const providers = Object.values(treebanks.state);
                const banks = providers
                    .flatMap(p => Object.values(p))
                    .filter(b => b.treebank.selected);

                return banks.map(bank => ({
                    bank: bank.treebank,
                    components: Object.values(bank.components).filter(c => c.selected && !c.disabled)
                }));
            })
        );
    }

    private createTotalsStream(
        componentsInput: Observable<Array<{bank: Treebank, components: TreebankComponent[]}>>,
        xpathInput: Observable<string>
    ) {
        return combineLatest(
            componentsInput,
            xpathInput
        )
        .pipe(
            switchMap(([banks, xpath]) => {
                // create a request for each bank
                const requests = banks.map(({bank, components}) =>
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
            })
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
        // ugly - extract state type
        let _: (InstanceType<typeof DistributionListComponent>)['state'][string][string]['components'][string];

        function makeCounts(provider: string, corpus: string, comps: Array<typeof _>) {
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
                        .filter(([id, comp]) => comp.hidden)
                        .map(([id, comp]) => id)
                });
            });
        });
    }
}

