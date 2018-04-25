import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { Hit, ResultsService } from '../../../services/results.service';
import { TableColumn } from '../../tables/selectable-table/TableColumn';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {

    @Input() treebank: string;
    @Input() results: Hit[] = [];
    @Input() loading: boolean = true;

    public treeXml?: string;

    filters = [];
    selectedFilters = [
    ];

    columns = [
        { field: 'number', header: '#', width: '5%' },
        { field: 'fileId', header: 'Component', width: '20%' },
        { field: 'highlightedSentence', header: 'Sentence', width: 'fill' },
    ];

    items: string[] = [];


    constructor(private resultsService: ResultsService) {
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
    async showTree(result: Hit) {
        this.treeXml = undefined;
        this.treeXml = await this.resultsService.highlightSentenceTree(result.fileId, this.treebank, result.nodeIds);
    }
}
