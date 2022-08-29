import { Component } from '@angular/core';
import { FilterDirective } from '../filter/filter.directive';
import { TextFilter } from '../../../models/filter';
import { FilterValue } from '../../../services/_index';

@Component({
    selector: 'grt-dropdown',
    templateUrl: './dropdown.component.html',
    styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent extends FilterDirective<TextFilter> {
    public selected: string[];

    onFilterSet(filter: TextFilter) {
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
