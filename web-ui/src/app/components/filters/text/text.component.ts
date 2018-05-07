import { Component } from '@angular/core';
import { FilterComponent } from "../filter/filter.component";

@Component({
    selector: 'text',
    templateUrl: './text.component.html',
    styleUrls: ['./text.component.scss']
})
export class TextComponent extends FilterComponent {
    onFilterSet() {
    }

    filterChange(e) {
        this.onFilterChange.emit({
            field: this.filter.field,
            selected: e.target.checked,
            type: 'single',
            value: e.target.checked,
        });
    }
}
