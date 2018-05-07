import { Component } from '@angular/core';
import { FilterComponent } from "../filter/filter.component";
import { Filter } from '../filters.component';

@Component({
    selector: 'dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent extends FilterComponent {
    public selected: string;

    onFilterSet(filter: Filter) {
        this.selected = filter.options[0];
    }

    updateFilterChange(selected) {
        const change = {
            field: this.filter.field,
            selected: selected,
            value: this.selected
        };

        this.onFilterChange.emit(change);
    }
}
