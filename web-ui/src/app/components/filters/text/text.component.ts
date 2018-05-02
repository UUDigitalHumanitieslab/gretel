import {Component, OnInit} from '@angular/core';
import {FilterComponent} from "../filter/filter.component";

@Component({
  selector: 'text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.scss']
})
export class TextComponent extends FilterComponent implements OnInit {


  ngOnInit() {
  }

  filterChange(e) {
    const change = {
      field: this.filter.field,
      selected: e.target.checked,
      value: e.target.checked,
    };

    this.onFilterChange.emit(change);
  }

}
