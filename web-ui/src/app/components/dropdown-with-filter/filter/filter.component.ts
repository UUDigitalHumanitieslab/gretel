import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as _ from 'lodash';
/**
 * Component used to filter the given items. This is just done with string matching
 */
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {


  /** the items to filter*/
  @Input() items: string[] = [];
  /** event that emits the results of applying the filter */
  @Output() filter: EventEmitter<string[]>;


  constructor() {
    this.filter = new EventEmitter();
  }


  ngOnInit() {
  }

  /**
   * Applies the filter to the given items and emits the items that pass the filter.
   * @param filterString: the string to filter the items on
   */
  applyFilter(filterString: string) {
    const newItems = this.items.filter(item => _.includes(item, filterString));
    this.filter.emit(newItems);
  }
}
