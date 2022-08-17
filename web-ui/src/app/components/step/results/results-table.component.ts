import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { animations } from '../../../animations';
import { HitWithOrigin, FilterValues, FilterByXPath } from '../../../services/_index';

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

    @Input('filterValues')
    public filterValues: FilterValues;

    @Input()
    /**
     * Filters on node properties created in the analysis component
     */
    public filterXPaths: FilterByXPath[] = [];

    @Input()
    public activeFilterCount: number;

    @Input()
    public retrieveContext: boolean;

    @Output()
    public changeFilterValues = new EventEmitter<FilterValues>();

    @Output()
    public deleteFilter = new EventEmitter<FilterByXPath>();

    @Output()
    public downloadResults = new EventEmitter<boolean>();

    @Output()
    public downloadFilelist = new EventEmitter<void>();

    @Output()
    public prev = new EventEmitter<void>();

    @Output()
    public next = new EventEmitter<void>();

    @Output()
    public showTree = new EventEmitter<HitWithOrigin>();

    @Output()
    public toggleContext = new EventEmitter<void>();

    /**
     * Toggle filters column
     */
    public hideFiltersColumn = false;
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

    public filterChange(filterValues: FilterValues) {
        this.changeFilterValues.next(filterValues);
    }

    public print() {
        (window as any).print();
    }
}
