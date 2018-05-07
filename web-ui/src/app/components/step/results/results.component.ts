import { Component, Input, OnChanges, SimpleChange } from '@angular/core';

import { ClipboardService } from 'ngx-clipboard';

import { ConfigurationService } from "../../../services/configuration.service";
import { Hit, ResultsService } from '../../../services/results.service';
import { DownloadService } from '../../../services/download.service';
import { TableColumn } from '../../tables/selectable-table/TableColumn';
import { Filter } from '../../filters/filters.component';
import { TreebankService } from '../../../services/_index';

@Component({
    selector: 'grt-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnChanges {
    @Input() corpus: string;
    @Input() components: string[];
    @Input() results: Hit[] = [];
    @Input() xpath: string;
    @Input() loading: boolean = true;

    public treeXml?: string;
    public filteredResults: Hit[] = [];
    public xpathCopied = false;

    filters: Filter[] = [];
    selectedFilters = [
    ];

    columns = [
        { field: 'number', header: '#', width: '5%' },
        { field: 'fileId', header: 'ID', width: '20%' },
        { field: 'component', header: 'Component', width: '20%' },
        { field: 'highlightedSentence', header: 'Sentence', width: 'fill' },
    ];
    hiddenComponents: { [component: string]: true } = {};

    constructor(private configurationService: ConfigurationService,
        private downloadService: DownloadService,
        private clipboardService: ClipboardService,
        private resultsService: ResultsService,
        private treebankService: TreebankService) {
    }

    ngOnChanges(changes: TypedChanges) {
        // TODO: limit the calls, have some delays here, don't retrieve if nothing changed
        // TODO: handle when components have been selected and/or filters applied (although the latter is part of #36)
        let countsPromise =
            this.xpath && this.corpus && this.components
                ? this.resultsService.metadataCounts(this.xpath, this.corpus, this.components)
                : Promise.resolve({});

        if (changes.corpus && (changes.corpus.firstChange || changes.corpus.currentValue != changes.corpus.previousValue)) {
            this.treebankService.getMetadata(this.corpus).then(async metadata => {
                let counts = await countsPromise;
                let filters: Filter[] = [];
                for (let filter of metadata) {
                    if (filter.show) {
                        let options: string[] = [];
                        if (filter.field in counts) {
                            for (let key of Object.keys(counts[filter.field])) {
                                // TODO: show the frequency (the data it right here now!)
                                options.push(key);
                            }
                        }
                        filters.push({
                            field: filter.field,
                            dataType: filter.type,
                            filterType: filter.facet,
                            minValue: filter.minValue,
                            maxValue: filter.maxValue,
                            options
                        });
                    }
                }
                this.filters = filters;
            });
        }

        if (changes.results && (changes.results.firstChange || changes.results.previousValue != changes.results.currentValue)) {
            this.hideComponents();
        }
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
