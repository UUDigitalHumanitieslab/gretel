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


    filters = [];
    selectedFilters = [
    ];

    columns = [
        {field: 'number', header: '#', width: '5%'},
        {field: 'fileId', header: 'component', width: '20%'},
        {field: 'highlightedSentence', header: 'Sentence', width: 'fill'},
    ];

    items: string[] = [];


    constructor(private http: HttpClient, private configurationService: ConfigurationService) {
        for(let i = 0; i < 100; i++){
            this.filters.push(`${i}`)
        }

    }

    ngOnInit() {
    }


    ngOnChanges(e){

    }

    /**
     * Show a tree of the given xml file
     * @param link to xml file
     */
    showTree(result) {
        let base = this.configurationService.getBaseUrlGretel();
        let element: any = $('#output');
        let url = base + "/" + this.constructLink(result);
        element.treeVisualizer(url, {
            nvFontSize: 14, normalView: false,
            initFSOnClick: true
        });
    }

    constructLink(result){
        return `front-end-includes/show-tree.php?sid=${result.fileId}&tb=test2&db=test2&id=${result.nodeIds.join('-')}`;
    }

}
