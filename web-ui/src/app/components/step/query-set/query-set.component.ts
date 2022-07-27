import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MweQuerySet, MweQuery } from '../../../services/mwe.service';

@Component({
    selector: 'grt-query-set',
    templateUrl: './query-set.component.html',
    styleUrls: ['./query-set.component.scss']
})
export class QuerySetComponent implements OnInit {

    @Input()
    queryset: MweQuerySet;

    @Output()
    onSelect = new EventEmitter<MweQuery>();

    constructor() { }

    ngOnInit(): void {
    }

    sendQuery(index: number) {
        this.onSelect.emit(this.queryset[index]);
    }
}
