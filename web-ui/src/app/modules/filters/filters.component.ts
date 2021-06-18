import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FilterByField, FilterValues } from '../../services/_index';
import { FilterChangeEvent } from './filter/filter.directive';

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

    private addToSelectedFilters(filterValue: FilterByField) {
        this.filterChange.emit(Object.assign({}, this.filterValues, {
            [filterValue.field]: filterValue
        }));
    }

    private removeFromSelectedFilters(filterValue: FilterByField) {
        const { [filterValue.field]: _, ...remaining } = this.filterValues;
        this.filterChange.emit(remaining);
    }
}
