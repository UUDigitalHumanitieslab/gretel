import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FilterService} from './filter.service';






export interface Filter{
  field;
  dataType;
  filterType;
  options;
  min_value;
  max_value;
}

export interface FilterValue {
  field: string;
  value;
}

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  @Input() filters;

  @Output() filterChange = new EventEmitter<FilterValue[]>();

  selectedFilters = [];

  constructor(private filterService: FilterService) {
  }

  ngOnInit() {
      this.filters = this.filterService.getExampleFilters()
  }

  filterChanged(e) {
    if (e.selected) {
      this.addToSelectedFilters(e);
    } else {
      this.removeFromSelectedFilters(e);
    }

  }

  addToSelectedFilters(e) {
    const location = this.selectedFilters.findIndex((el) => el.field === e.field);
    if (location === -1) {
      this.selectedFilters.push(e);
    } else {
      this.selectedFilters[location] = e;
      this.selectedFilters = this.selectedFilters.slice();
    }
    this.filterChange.emit(this.selectedFilters);
  }

  removeFromSelectedFilters(e) {
    this.selectedFilters = this.selectedFilters.filter((el) => el.field !== e.field);
    this.filterChange.emit(this.selectedFilters);
  }

}
