import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';

import { ClipboardService } from 'ngx-clipboard';

import { ConfigurationService } from "../../../services/configuration.service";
import { Hit, ResultsService } from '../../../services/results.service';
import { DownloadService } from '../../../services/download.service';
import { TableColumn } from '../../tables/selectable-table/TableColumn';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnChanges, OnInit {
    @Input() corpus: string;
    @Input() components: string[];
    @Input() results: Hit[] = [];
    @Input() xpath: string;
    @Input() loading: boolean = true;

    public treeXml?: string;
    public filteredResults: Hit[] = [];
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
    hiddenComponents: { [component: string]: true } = {};

    constructor(private configurationService: ConfigurationService, private downloadService: DownloadService,
        private clipboardService: ClipboardService, private resultsService: ResultsService) {
    }

    ngOnChanges(changes: TypedChanges) {
        if (changes.results && (changes.results.firstChange || changes.results.previousValue != changes.results.currentValue)) {
            this.hideComponents();
        }
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

    public hideComponents(components: string[] | undefined = undefined) {
        if (components !== undefined) {
            this.hiddenComponents = Object.assign({}, ...components.map(name => { return { [name]: true } }));
        }

        this.filteredResults = this.results.filter(result => !this.hiddenComponents[result.databaseId]);
    }

    public print() {
        (window as any).print();
    }
}
type TypedChanges = {
    [propName in keyof ResultsComponent]: SimpleChange;
}
