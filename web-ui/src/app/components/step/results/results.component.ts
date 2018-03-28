import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {Result} from './result';
import {TableColumn} from '../../tables/selectable-table/TableColumn';

import * as $ from 'jquery';
import '../../../../assets/js/tree-visualizer';
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {


    @Input() results: Result[];
    @Input() loading: boolean;

    columns: any[] = [
        {field: 'number', header: '#', width: '5%'},
        {field: 'id', header: 'ID', width: '10%'},
        {field: 'component', header: 'component', width: '15%'},
        {field: 'sentence', header: 'Sentence', width: '70%'},
    ];

    items: string[] = [
    ];


    constructor(private http: HttpClient) {
    }

    ngOnInit() {
    }

    showTree(item) {
        //TODO set in configuration (service?)
        let base = "http://localhost:8080/gretel/";
        console.log(item);
        let element: any = $('#output');

            element.treeVisualizer(base + item.link, {
                nvFontSize: 14, normalView: false,
                initFSOnClick: true
            });


    }

}
