import { EventEmitter, Input, Output, Directive } from '@angular/core';
import { Filter } from '../filters.component';
import { FilterByField } from '../../../services/_index';

export type FilterChangeEvent = FilterByField & {
    selected: boolean
};

@Directive()
export abstract class FilterDirective {
    private filterDefinition: Filter;

    @Input('filterValue') set filterValue(value: FilterByField) {
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

    onCheckBoxClicked(e: Event) {
        this.updateFilterChange((e.target as HTMLInputElement).checked);
    }

    updateFilterChange(selected: boolean) {
        throw Error('Not implemented');
    }

    abstract onFilterSet(filter: Filter): void;
    abstract onFilterValueSet(filterValue: FilterByField): void;
}
