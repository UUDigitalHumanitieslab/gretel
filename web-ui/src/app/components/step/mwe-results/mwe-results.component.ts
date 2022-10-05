import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ResultsComponent } from '../results/results.component';
import { MweQuerySet, MweQuery } from '../../../services/mwe.service';

import {
    debounceTime,
    distinctUntilChanged,
    endWith,
    filter,
    map,
    startWith,
    switchMap
} from 'rxjs/operators';
import { combineLatest, Observable, merge } from 'rxjs';
import {FilterValue} from '../../../services/_index';
import { GlobalState } from '../../../pages/multi-step-page/steps';

const DebounceTime = 200;

@Component({
    selector: 'grt-mwe-results',
    templateUrl: './mwe-results.component.html',
    styleUrls: ['./mwe-results.component.scss'],
    providers: [{ provide: ResultsComponent, useClass: MweResultsComponent }],

})
export class MweResultsComponent extends ResultsComponent {
    @Input()
    public canSaveQuery: boolean = true;

    @Input()
    public canonicalForm: string;

    @Input()
    public currentQuery: MweQuery;

    @Input()
    public querySet: MweQuerySet;

    @Output()
    public saveQuery = new EventEmitter();

    @Output()
    public changeQuery = new EventEmitter<MweQuery>();

    isQueryAdjusted() {
        return this.currentQuery.id ?? false;
    }

    get supersetQuery() {
        // TODO: avoid constant index
        return this.querySet[2];
    }

    protected createResultsStream(state$: Observable<GlobalState>, filterValue$: Observable<FilterValue[]>) {
        let behaviour = {
            supersetXpath: this.supersetQuery.xpath,
            expandIndex: true
        };

        return combineLatest(
            [state$, filterValue$]
        ).pipe(
            filter((values) => values.every(value => value != null)),
            map(([state, filterValues]) => ({
                retrieveContext: state.retrieveContext,
                selectedTreebanks: state.selectedTreebanks,
                xpath: state.xpath,
                filterValues
            })),
            distinctUntilChanged((prev, curr) => {
                // results are going to be reloaded, but we need to
                // wait for the debouncing first.
                // already give feedback a change is pending,
                // so the user doesn't think the interface is stuck
                this.loading = true;
                return prev.retrieveContext === curr.retrieveContext &&
                    prev.filterValues === curr.filterValues &&
                    prev.xpath === curr.xpath &&
                    prev.selectedTreebanks.equals(curr.selectedTreebanks);
            }),
            debounceTime(DebounceTime),
            switchMap(({ selectedTreebanks, xpath, filterValues }) => {
                // create a request for each treebank
                const resultStreams = this.resultsStreamService.stream(
                    xpath,
                    selectedTreebanks,
                    filterValues,
                    behaviour
                );

                // join all results, and wrap the entire sequence in a start and end message so
                // we know what's happening and can update spinners etc.
                return merge(...resultStreams).pipe(
                    startWith('start'),
                    endWith('finish'),
                );
            }),
        );
    }
}
