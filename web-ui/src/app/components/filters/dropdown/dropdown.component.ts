import { Component } from '@angular/core';
import { FilterComponent } from '../filter/filter.component';
import { Filter } from '../filters.component';
import { FilterValue } from '../../../services/_index';

@Component({
    selector: 'grt-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent extends FilterComponent {
    public selected: string[];

    onFilterSet(filter: Filter) {
        if (!this.selected) {
            this.selected = [];
        }
    }

    onFilterValueSet(filterValue: FilterValue) {
        if (filterValue && filterValue.type === 'multiple') {
            this.selected = filterValue.values;
        } else {
            this.selected = [];
        }
    }

    updateFilterChange() {
        this.filterChange.emit({
            dataType: 'text',
            field: this.filter.field,
            type: 'multiple',
            selected: this.selected.length > 0,
            values: this.selected.concat([])
        });
    }
}
