import { Component } from '@angular/core';
import { FilterComponent } from "../filter/filter.component";
import { Filter } from '../filters.component';

@Component({
    selector: 'date',
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

    updateFilterChange(selected: boolean) {
        const change = {
            field: this.filter.field,
            selected: selected,
            value: {
                minValue: this.dateToString(this.minValue),
                maxValue: this.dateToString(this.maxValue)
            }
        };

        this.onFilterChange.emit(change);
    }

    dateToString(date: Date) {
        return date.toISOString().split('T')[0];
    }
}
