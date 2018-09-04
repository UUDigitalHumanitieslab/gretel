import { Component } from '@angular/core';
import { FilterComponent } from "../filter/filter.component";
import { Filter } from '../filters.component';

@Component({
    selector: 'grt-date',
    templateUrl: './date.component.html',
    styleUrls: ['./date.component.scss']
})
export class DateComponent extends FilterComponent {
    minValue: Date;
    maxValue: Date;

    onFilterSet(filter: Filter) {
        this.minValue = filter.minValue as Date;
        this.maxValue = filter.maxValue as Date;
    }

    updateFilterChange() {
        function bound(min: any, value: Date, max: any) {
            if (value < min) {
                return min;
            }
            if (value > max) {
                return max;
            }

            return value;
        }

        let min = bound(this.filter.minValue, this.minValue, this.filter.maxValue);
        let max = bound(min, this.maxValue, this.filter.maxValue);
        if (min > max) {
            min = max;
        }

        this.onFilterChange.emit({
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
}
