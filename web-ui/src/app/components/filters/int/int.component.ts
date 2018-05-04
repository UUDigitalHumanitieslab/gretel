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
        if (filter.min_value) {
            this.value = filter.min_value;
        } else if (filter.max_value) {
            this.value = filter.max_value;
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
