import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MWEQuerySet } from '../../../services/mwe-query-maker.service';

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

    constructor() { }

    ngOnInit(): void {
    }

}
