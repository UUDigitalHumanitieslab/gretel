import {Component, OnInit} from '@angular/core';
import {FilterComponent} from "../filter/filter.component";

@Component({
  selector: 'int',
  templateUrl: './int.component.html',
  styleUrls: ['./int.component.scss']
})
export class IntComponent extends FilterComponent implements OnInit {

  value: number;


  ngOnInit() {
    if (this.filter.min_value) {
      this.value = this.filter.min_value;
    } else if (this.filter.max_value) {
      this.value = this.filter.max_value;
    } else {
      this.value = 0;
    }
  }


  onCheckBoxClicked(e) {
    this.updateFilterChange(e.target.checked);
  }

  updateFilterChange(selected: boolean) {
    const change = {
      field: this.filter.field,
      selected: selected,
      value: this.value,
    };

    this.onFilterChange.emit(change);
  }
}
