import { Component } from '@angular/core';
import { FilterDirective } from '../filter/filter.directive';
import { Filter } from '../filters.component';
import { FilterValue } from '../../../services/_index';

@Component({
    selector: 'grt-date',
    templateUrl: './date.component.html',
    styleUrls: ['./date.component.scss']
})
export class DateComponent extends FilterDirective {
    minValue: Date;
    maxValue: Date;

    onFilterSet(filter: Filter) {
        this.minValue = this.minValue || filter.minValue as Date;
        this.maxValue = this.maxValue || filter.maxValue as Date;
    }

    onFilterValueSet(filterValue: FilterValue) {
        if (filterValue && filterValue.type === 'range') {
            this.minValue = new Date(filterValue.min as string),
                this.maxValue = new Date(filterValue.max as string);
        } else if (this.filter) {
            // default value
            this.onFilterSet(this.filter);
        }
    }

    updateFilterChange() {
        let min = this.bound(
            this.filter.minValue as Date,
            this.minValue,
            this.filter.maxValue as Date);
        const max = this.bound(
            min,
            this.maxValue,
            this.filter.maxValue as Date);
        if (min > max) {
            min = max;
        }

        this.filterChange.emit({
            dataType: 'date',
            field: this.filter.field,
            selected: min > this.filter.minValue || max < this.filter.maxValue,
            type: 'range',
            min: this.dateToString(min),
            max: this.dateToString(max)
        });
    }

    dateToString(date: Date) {
        return date.toISOString().split('T')[0];
    }

    private bound<T>(min: T, value: T, max: T) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }

        return value;
    }
}
