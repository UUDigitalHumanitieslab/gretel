import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Filter } from '../../models/filter';
import { FilterValue, FilterValues } from '../../services/_index';
import { FilterChangeEvent } from './filter/filter.directive';

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
        this.filterChange.emit(Object.assign({}, this.filterValues, {
            [filterValue.field]: filterValue
        }));
    }

    private removeFromSelectedFilters(filterValue: FilterValue) {
        const { [filterValue.field]: _, ...remaining } = this.filterValues;
        this.filterChange.emit(remaining);
    }
}
