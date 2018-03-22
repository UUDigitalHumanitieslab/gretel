import {Component, Input, OnInit} from '@angular/core';
import {TableColumn} from '../selectable-table/TableColumn';

/** A table that becomes scrollable when it passes the height of the parent. To make sure this  */
@Component({
    selector: 'app-scrollable-table',
    templateUrl: './scrollable-table.component.html',
    styleUrls: ['./scrollable-table.component.scss']
})
export class ScrollableTableComponent implements OnInit {

    /** The data to show in the tables */
    @Input() data: any;
    /** The columns of the table*/
    @Input() columns: TableColumn[];

    constructor() {
    }

    ngOnInit() {
    }


    showTree() {
        console.log('showTree');
    }


}
