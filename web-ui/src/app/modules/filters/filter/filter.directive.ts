import { EventEmitter, Input, Output, Directive } from '@angular/core';
import { Filter } from '../../../models/filter';
import { FilterValue } from '../../../services/_index';

export type FilterChangeEvent = FilterValue & {
    selected: boolean
};

@Directive()
export abstract class FilterDirective<T extends Filter> {
    filter: T;

    @Input('filterValue') set filterValue(value: FilterValue) {
        this.onFilterValueSet(value);
    }

    @Input('filter') set filterDefinition(value: Filter) {
        this.filter = <T>value;
        if (value !== undefined) {
            this.onFilterSet(<T>value);
        }
    }

    @Output()
    filterChange = new EventEmitter<FilterChangeEvent>();

    constructor() {
    }

    onCheckBoxClicked(e: Event) {
        this.updateFilterChange((e.target as HTMLInputElement).checked);
    }

    updateFilterChange(selected: boolean) {
        throw Error('Not implemented');
    }

    abstract onFilterSet(filter: T): void;
    abstract onFilterValueSet(filterValue: FilterValue): void;
}
