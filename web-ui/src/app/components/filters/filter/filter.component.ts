import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Filter} from "../filters.component";


interface ChangeEvent {
  field: any;
  selected: boolean;
  value;
}


@Component({
  selector: 'filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Input() filter: Filter;
  @Output() onFilterChange = new EventEmitter<ChangeEvent>();

  constructor() {
  }

  onCheckBoxClicked(e) {
    this.updateFilterChange(e.target.checked);
  }

  ngOnInit() {
  }

  updateFilterChange(selected) {
    throw Error('Not implemented');
  }

}
