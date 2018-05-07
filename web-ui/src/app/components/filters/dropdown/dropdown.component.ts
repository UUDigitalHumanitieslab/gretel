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
        this.onFilterChange.emit({
            field: this.filter.field,
            type: 'single',
            selected: selected,
            value: this.selected
        });
    }
}
