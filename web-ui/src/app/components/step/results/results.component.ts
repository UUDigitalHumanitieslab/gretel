import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';

import { ClipboardService } from 'ngx-clipboard';

import { TableColumn } from '../../tables/selectable-table/TableColumn';

import * as $ from 'jquery';
import '../../../../assets/js/tree-visualizer';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConfigurationService, DownloadService, Hit, ResultsService } from "../../../services/_index";

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
    @Input() corpus: string;
    @Input() components: string[];
    @Input() results: Hit[] = [];
    @Input() xpath: string;
    @Input() loading: boolean = true;

    public xpathCopied = false;

    filters = [];
    selectedFilters = [
    ];

    columns = [
        { field: 'number', header: '#', width: '5%' },
        { field: 'fileId', header: 'ID', width: '20%' },
        { field: 'component', header: 'Component', width: '20%' },
        { field: 'highlightedSentence', header: 'Sentence', width: 'fill' },
    ];

    items: string[] = [];


    constructor(private http: HttpClient, private configurationService: ConfigurationService, private downloadService: DownloadService,
        private resultsService: ResultsService,
        private clipboardService: ClipboardService) {
        for (let i = 0; i < 100; i++) {
            this.filters.push(`${i}`)
        }

    }

    ngOnInit() {
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

    constructLink(result) {
        return `front-end-includes/show-tree.php?sid=${result.fileId}&tb=test2&db=test2&id=${result.nodeIds.join('-')}`;
    }

    public downloadResults() {
        this.downloadService.downloadResults(this.corpus, this.components, this.xpath, this.results);
    }

    public downloadXPath() {
        this.downloadService.downloadXPath(this.xpath);
    }

    public copyXPath() {
        if (this.clipboardService.copyFromContent(this.xpath)) {
            this.xpathCopied = true;
            setTimeout(() => {
                this.xpathCopied = false;
            }, 5000);
        }
    }

    public print() {
        (window as any).print();
    }
}
