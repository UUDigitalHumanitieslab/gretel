import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MweQuerySet, MweQuery } from '../../../services/mwe-query-maker.service';

@Component({
    selector: 'grt-query-set',
    templateUrl: './query-set.component.html',
    styleUrls: ['./query-set.component.scss']
})
export class QuerySetComponent implements OnInit {

    @Input()
    queryset: MweQuerySet;

    @Output()
    onSelect = new EventEmitter<string>();

    // used to indicate which queries should be used to exclude results from the target query
    exclude: boolean[] = [];

    constructor() { }

    ngOnInit(): void {
    }

    prepareQuery(index: number) : MweQuery {
        let query = this.queryset.queries[index];

        for (let j = 0; j < index; j++) {
            if (this.exclude[j]) {
                query.xpath = `${query.xpath} except ${this.queryset.queries[j].xpath}`;
            }
        }

        return query;
    }

    sendQuery(index: number) {
        let query = this.prepareQuery(index);
        this.onSelect.emit(query.xpath);
    }
}
