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
        this.onFilterChange.emit({
            field: this.filter.field,
            selected,
            type: 'range',
            min: this.dateToString(this.minValue),
            max: this.dateToString(this.maxValue)
        });
    }

    dateToString(date: Date) {
        return date.toISOString().split('T')[0];
    }
}
