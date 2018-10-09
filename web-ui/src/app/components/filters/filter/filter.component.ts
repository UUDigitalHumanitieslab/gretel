import { EventEmitter, Input, Output } from '@angular/core';
import { Filter } from '../filters.component';
import { FilterValue } from '../../../services/_index';

export type FilterChangeEvent = FilterValue & {
    selected: boolean
};

export abstract class FilterComponent {
    private filterDefinition;

    @Input('filterValue') set filterValue(value: FilterValue) {
        this.onFilterValueSet(value);
    }

    @Input('filter') set filter(value: Filter) {
        this.filterDefinition = value;
        if (value !== undefined) {
            this.onFilterSet(value);
        }
    }

    @Output()
    filterChange = new EventEmitter<FilterChangeEvent>();

    get filter() {
        return this.filterDefinition;
    }

    constructor() {
    }

    onCheckBoxClicked(e) {
        this.updateFilterChange(e.target.checked);
    }

    updateFilterChange(selected) {
        throw Error('Not implemented');
    }

    abstract onFilterSet(filter: Filter);
    abstract onFilterValueSet(filterValue: FilterValue);
}
