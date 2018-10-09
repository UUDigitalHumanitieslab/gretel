import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FilterValue, FilterValues } from '../../services/_index';
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

    @Input()
    public filterValues: FilterValues = {};

    @Output()
    public filterChange = new EventEmitter<FilterValues>();

    public filterChanged(event: FilterChangeEvent) {
        if (event.selected) {
            this.addToSelectedFilters(event);
        } else {
            this.removeFromSelectedFilters(event);
        }
    }

    private addToSelectedFilters(filterValue: FilterValue) {
        this.filterChange.emit(Object.assign({
            [filterValue.field]: filterValue
        }, this.filterValues));
    }

    private removeFromSelectedFilters(filterValue: FilterValue) {
        const { [filterValue.field]: _, ...remaining } = this.filterValues;
        this.filterChange.emit(remaining);
    }
}
