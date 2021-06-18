import { Component } from '@angular/core';
import { FilterDirective } from '../filter/filter.directive';
import { Filter } from '../filters.component';
import { FilterValue } from '../../../services/results.service';

@Component({
    selector: 'grt-int',
    templateUrl: './int.component.html',
    styleUrls: ['./int.component.scss']
})
export class IntComponent extends FilterDirective {
    public value: number;

    rangeValues: number[] = [0, 0];

    onFilterSet(filter: Filter) {
        this.rangeValues = [this.rangeValues[0] || filter.minValue as number || 0,
        this.rangeValues[1] || filter.maxValue as number || 0];
    }

    onFilterValueSet(filterValue: FilterValue) {
        if (filterValue && filterValue.type === 'range') {
            this.rangeValues = [filterValue.min as number || 0, filterValue.max as number || 0];
        } else if (this.filter) {
            // revert to default
            this.onFilterSet(this.filter);
        }
    }

    updateFilterChange() {
        const min = this.rangeValues[0], max = this.rangeValues[1];
        this.filterChange.emit({
            dataType: 'int',
            type: 'range',
            field: this.filter.field,
            selected: min > this.filter.minValue || max < this.filter.maxValue,
            min,
            max
        });
    }
}
