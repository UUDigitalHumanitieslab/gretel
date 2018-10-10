import { Input, Component, EventEmitter, Output } from '@angular/core';
import { FilterByXPath, FilterValues } from '../../../services/_index';

@Component({
    selector: 'grt-filters-by-xpath',
    templateUrl: './filters-by-xpath.component.html'
})
export class FiltersByXPathComponent {
    @Input()
    public filters: FilterByXPath[];

    @Output()
    public delete = new EventEmitter<FilterByXPath>();
}
