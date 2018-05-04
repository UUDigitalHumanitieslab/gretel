import { EventEmitter, Input, Output } from '@angular/core';
import { Filter } from "../filters.component";

interface ChangeEvent {
    field: any;
    selected: boolean;
    value;
}

export abstract class FilterComponent {
    private filterValue;
    @Input('filter') set filter(value: Filter) {
        this.filterValue = value;
        if (value !== undefined) {
            this.onFilterSet(value);
        }
    }
    get filter() { return this.filterValue };

    @Output() onFilterChange = new EventEmitter<ChangeEvent>();

    constructor() {
    }

    onCheckBoxClicked(e) {
        this.updateFilterChange(e.target.checked);
    }

    ngOnInit() {
    }

    updateFilterChange(selected) {
        throw Error('Not implemented');
    }

    abstract onFilterSet(filter: Filter);
}
