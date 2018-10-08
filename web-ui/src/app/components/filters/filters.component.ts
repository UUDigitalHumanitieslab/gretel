import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FilterValue } from '../../services/_index';
import { FilterChangeEvent } from './filter/filter.component';

export interface Filter {
    field: string;
    dataType: string;
    filterType: 'checkbox' | 'slider' | 'range' | 'dropdown';
    options: string[];
    minValue?: Date | number;
    maxValue?: Date | number;
}

@Component({
    selector: 'grt-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss']
})
export class FiltersComponent {
    @Input()
    public filters: Filter[];

    @Output()
    public filterChange = new EventEmitter<FilterValue[]>();

    private selectedFilters: FilterValue[] = [];

    public filterChanged(event: FilterChangeEvent) {
        if (event.selected) {
            this.addToSelectedFilters(event);
        } else {
            this.removeFromSelectedFilters(event);
        }
    }

    private addToSelectedFilters(filterValue: FilterValue) {
        const location = this.selectedFilters.findIndex((el) => el.field === filterValue.field);
        if (location === -1) {
            this.selectedFilters.push(filterValue);
        } else {
            this.selectedFilters[location] = filterValue;
            this.selectedFilters = this.selectedFilters.slice();
        }
        this.filterChange.emit(this.selectedFilters);
    }

    private removeFromSelectedFilters(filterValue: FilterValue) {
        this.selectedFilters = this.selectedFilters.filter((el) => el.field !== filterValue.field);
        this.filterChange.emit(this.selectedFilters);
    }
}
