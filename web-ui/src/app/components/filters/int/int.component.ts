import { Component } from '@angular/core';
import { FilterComponent } from '../filter/filter.component';
import { Filter } from '../filters.component';
import { FilterValue } from '../../../services/results.service';

@Component({
    selector: 'grt-int',
    templateUrl: './int.component.html',
    styleUrls: ['./int.component.scss']
})
export class IntComponent extends FilterComponent {
    public value: number;

    rangeValues: number[];

    onFilterSet(filter: Filter) {
        this.rangeValues = [filter.minValue as number || 0, filter.maxValue as number || 0];
    }

    onFilterValueSet(filterValue: FilterValue) {
        if (filterValue && filterValue.type === 'range') {
            this.rangeValues = [filterValue.min as number || 0, filterValue.max as number || 0];
        } else if (this.filter) {
            // revert to default
            this.onFilterSet(this.filter);
        }
    }

    onCheckBoxClicked(e) {
        this.updateFilterChange(e.target.checked);
    }

    updateFilterChange(selected: boolean) {
        this.filterChange.emit({
            dataType: 'int',
            type: 'range',
            field: this.filter.field,
            selected: selected,
            min: this.rangeValues[0],
            max: this.rangeValues[1]
        });
    }
}
