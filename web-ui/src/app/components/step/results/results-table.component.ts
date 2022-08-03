import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { animations } from '../../../animations';

@Component({
    animations,
    selector: 'grt-results-table',
    templateUrl: './results-table.component.html',
    styleUrls: ['./results-table.component.scss'],
})
export class ResultsTableComponent implements OnInit {
    @Input()
    public loading = true;

    @Input()
    public filteredResults = [];

    @Input()
    public filters = [];

    @Output()
    public prev = new EventEmitter();

    @Output()
    public next = new EventEmitter();

    @Output()
    public showTree = new EventEmitter();


    public hiddenCount = 0;
    public loadingDownload = false;

    public columns = [
        { field: 'number', header: '#', width: '5%' },
        { field: 'fileId', header: 'ID', width: '20%' },
        { field: 'componentDisplayName', header: 'Component', width: '20%' },
        { field: 'highlightedSentence', header: 'Sentence', width: 'fill' },
    ];

    ngOnInit() {
        this.filteredResults = [];
    }
}
