import { Component } from '@angular/core';
import { FilterComponent } from "../filter/filter.component";
import { Filter } from '../filters.component';

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

    filterChange(e) {
        if (e.event.target.checked) {
            this.addToValues(e.value);
        } else {
            this.removeFromValues(e.value);
        }

        this.onFilterChange.emit({
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
