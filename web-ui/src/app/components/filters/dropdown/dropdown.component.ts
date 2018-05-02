import {Component, OnInit} from '@angular/core';
import {FilterComponent} from "../filter/filter.component";

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent extends FilterComponent implements OnInit {
  selected;
  ngOnInit() {
    this.selected = this.filter.options[0];
  }


  updateFilterChange(selected){

    const change = {
      field: this.filter.field,
      selected: selected,
      value: this.selected
    };

    this.onFilterChange.emit(change);
  }
}
