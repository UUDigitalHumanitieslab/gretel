import { Component } from '@angular/core';
import { FilterComponent } from '../filter/filter.component';
import { Filter } from '../filters.component';
import { FilterValue } from '../../../services/_index';

@Component({
    selector: 'grt-text',
    templateUrl: './text.component.html',
    styleUrls: ['./text.component.scss']
})
export class TextComponent extends FilterComponent {
    public options: string[] = [];

    private values: string[] = [];

    onFilterSet(filter: Filter) {
        this.options = filter.options.sort((a, b) => a.localeCompare(
            b,
            undefined,
            {
                sensitivity: 'base',
                numeric: true
            }));
    }

    onFilterValueSet(filterValue: FilterValue) {
        if (filterValue && filterValue.type === 'multiple') {
            this.values = filterValue.values;
        }
    }

    onFilterChange(event: Event, value: string) {
        if ((<HTMLInputElement>event.target).checked) {
            this.addToValues(value);
        } else {
            this.removeFromValues(value);
        }

        this.filterChange.emit({
            dataType: 'text',
            type: 'multiple',
            field: this.filter.field,
            selected: this.values.length > 0,
            values: this.values,
        });
    }

    addToValues(value: string) {
        if (this.values.indexOf(value) < 0) {
            this.values.push(value);
        }
    }

    removeFromValues(value) {
        this.values = this.values.filter((x) => x !== value);
    }
}
