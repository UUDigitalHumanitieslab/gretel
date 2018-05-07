import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface Filter {
    field: string;
    dataType: string;
    filterType: 'checkbox' | 'slider' | 'range' | 'dropdown';
    options: string[];
    minValue?: Date | number;
    maxValue?: Date | number;
}

export interface FilterValue {
    field: string;
    value;
}

@Component({
    selector: 'grt-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss']
})
export class FiltersComponent {
    @Input() filters: Filter[];

    @Output() filterChange = new EventEmitter<FilterValue[]>();

    selectedFilters = [];

    filterChanged(e) {
        if (e.selected) {
            this.addToSelectedFilters(e);
        } else {
            this.removeFromSelectedFilters(e);
        }

    }

    addToSelectedFilters(e) {
        const location = this.selectedFilters.findIndex((el) => el.field === e.field);
        if (location === -1) {
            this.selectedFilters.push(e);
        } else {
            this.selectedFilters[location] = e;
            this.selectedFilters = this.selectedFilters.slice();
        }
        this.filterChange.emit(this.selectedFilters);
    }

    removeFromSelectedFilters(e) {
        this.selectedFilters = this.selectedFilters.filter((el) => el.field !== e.field);
        this.filterChange.emit(this.selectedFilters);
    }
}
