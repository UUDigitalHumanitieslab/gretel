import { Component, Input, OnInit } from '@angular/core';

import { ClipboardService } from 'ngx-clipboard';

import { ConfigurationService } from "../../../services/configuration.service";
import { Hit, ResultsService } from '../../../services/results.service';
import { DownloadService } from '../../../services/download.service';
import { TableColumn } from '../../tables/selectable-table/TableColumn';

@Component({
    selector: 'grt-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {
    @Input() corpus: string;
    @Input() components: string[];
    @Input() results: Hit[] = [];
    @Input() xpath: string;
    @Input() loading: boolean = true;

    public treeXml?: string;
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


    constructor(private configurationService: ConfigurationService, private downloadService: DownloadService,
        private clipboardService: ClipboardService, private resultsService: ResultsService) {
    }

    ngOnInit() {
    }


    /**
     * Show a tree of the given xml file
     * @param link to xml file
     */
    async showTree(result: Hit) {
        this.treeXml = undefined;
        this.treeXml = await this.resultsService.highlightSentenceTree(result.fileId, this.corpus, result.nodeIds);
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
