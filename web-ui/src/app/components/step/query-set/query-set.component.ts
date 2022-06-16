import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MWEQuerySet, MWEQuery } from '../../../services/mwe-query-maker.service';

@Component({
    selector: 'grt-query-set',
    templateUrl: './query-set.component.html',
    styleUrls: ['./query-set.component.scss']
})
export class QuerySetComponent implements OnInit {

    @Input()
    queryset: MWEQuerySet;

    @Output()
    onSelect = new EventEmitter<string>();

    // used for storing the user's request to run a given query while excluding the results
    // from the previous query on the list.
    exclude: boolean[] = [];

    constructor() { }

    ngOnInit(): void {
    }

    prepareQuery(index: number) : MWEQuery {
        let query = this.queryset.queries[index];
        if (index < 1) {
            return query;
        }

        if (this.exclude[index]) {
            let prev = this.queryset.queries[index - 1];
            // modify the query's xpath to exclude prev
            query.xpath = `/(${query.xpath} except ${prev.xpath})`;
        }

        return query;
    }

    sendQuery(index: number) {
        let query = this.prepareQuery(index);
        this.onSelect.emit(query.xpath);
    }
}
