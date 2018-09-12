import { Component } from '@angular/core';
import { FilterComponent } from "../filter/filter.component";
import { Filter } from '../filters.component';
import { FilterRangeValue } from "../../../services/results.service";

@Component({
    selector: 'grt-int',
    templateUrl: './int.component.html',
    styleUrls: ['./int.component.scss']
})
export class IntComponent extends FilterComponent {
    public value: number;

    rangeValues: number[];

    onFilterSet(filter: Filter) {
        this.rangeValues = [filter.minValue as number, filter.maxValue as number];
    }

    onCheckBoxClicked(e) {
        this.updateFilterChange(e.target.checked);
    }

    updateFilterChange(selected: boolean) {
        this.onFilterChange.emit({
            dataType: 'int',
            type: 'range',
            field: this.filter.field,
            selected: selected,
            min: this.rangeValues[0],
            max: this.rangeValues[1]
        });

    }


}
