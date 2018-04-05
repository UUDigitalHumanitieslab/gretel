import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {Result} from './result';
import {TableColumn} from '../../tables/selectable-table/TableColumn';

import * as $ from 'jquery';
import '../../../../assets/js/tree-visualizer';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {ConfigurationService} from "../../../services/configuration.service";

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnChanges {


    @Input() results: Result[] = [];
    @Input() loading: boolean = true;

    columns: any[] = [
        {field: 'number', header: '#', width: '5%'},
        {field: 'id', header: 'ID', width: '10%'},
        {field: 'component', header: 'component', width: '15%'},
        {field: 'sentence', header: 'Sentence', width: '70%'},
    ];

    items: string[] = [];


    constructor(private http: HttpClient, private configurationService: ConfigurationService) {
    }

    ngOnInit() {
    }


    ngOnChanges(e: any){
        console.log(e)
    }

    /**
     * Show a tree of the given xml file
     * @param link to xml file
     */
    showTree(link) {

        let base = this.configurationService.getBaseUrlXml();
        let element: any = $('#output');
        let url = base + "/" + link;

        element.treeVisualizer(url, {
            nvFontSize: 14, normalView: false,
            initFSOnClick: true
        });
    }

}
