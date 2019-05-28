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

    public values: { [value: string]: boolean } = {};

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
            this.values = filterValue.values.reduce(
                (dict, val) => ({ [val]: true, ...dict }),
                {});
        }
    }

    onFilterChange(event: Event, value: string) {
        if ((<HTMLInputElement>event.target).checked) {
            this.addToValues(value);
        } else {
            this.removeFromValues(value);
        }

        const values = Object.keys(this.values).filter(val => this.values[val]);
        this.filterChange.emit({
            dataType: 'text',
            type: 'multiple',
            field: this.filter.field,
            selected: values.length > 0,
            values: values,
        });
    }

    addToValues(value: string) {
        if (!this.values[value]) {
            this.values[value] = true;
        }
    }

    removeFromValues(value: string) {
        this.values[value] = false;
    }
}
