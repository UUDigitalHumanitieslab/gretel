import { Component } from '@angular/core';
import { FilterComponent } from "../filter/filter.component";
import { Filter } from '../filters.component';

@Component({
    selector: 'grt-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent extends FilterComponent {
    public selected: string[];

    onFilterSet(filter: Filter) {
        this.selected = [];
    }

    updateFilterChange(selected) {
        this.onFilterChange.emit({
            field: this.filter.field,
            type: 'multiple',
            selected: selected,
            values: this.selected
        });
    }
}
