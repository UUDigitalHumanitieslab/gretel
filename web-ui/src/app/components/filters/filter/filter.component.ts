import {EventEmitter, Input, Output} from '@angular/core';
import {Filter} from "../filters.component";
import {FilterValue} from '../../../services/_index';

export type FilterChangeEvent = FilterValue & {
    selected: boolean
};

export abstract class FilterComponent {
    private filterValue: Filter;

    @Input('filter') set filter(value: Filter) {
        this.filterValue = value;
        if (value !== undefined) {
            this.onFilterSet(value);
        }
    }

    get filter() {
        return this.filterValue
    };

    @Output() onFilterChange = new EventEmitter<FilterChangeEvent>();

    constructor() {
    }

    ngOnInit() {
    }

    updateFilterChange(selected: boolean) {
        throw Error('Not implemented');
    }

    abstract onFilterSet(filter: Filter): void;
}
