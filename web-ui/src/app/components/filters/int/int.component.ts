import { Component } from '@angular/core';
import { FilterComponent } from "../filter/filter.component";
import { Filter } from '../filters.component';

@Component({
    selector: 'int',
    templateUrl: './int.component.html',
    styleUrls: ['./int.component.scss']
})
export class IntComponent extends FilterComponent {
    public value: number;

    onFilterSet(filter: Filter) {
        if (filter.minValue) {
            this.value = filter.minValue as number;
        } else if (filter.maxValue) {
            this.value = filter.maxValue as number;
        } else {
            this.value = 0;
        }
    }

    onCheckBoxClicked(e) {
        this.updateFilterChange(e.target.checked);
    }

    updateFilterChange(selected: boolean) {
        const change = {
            field: this.filter.field,
            selected: selected,
            value: this.value,
        };

        this.onFilterChange.emit(change);
    }
}
