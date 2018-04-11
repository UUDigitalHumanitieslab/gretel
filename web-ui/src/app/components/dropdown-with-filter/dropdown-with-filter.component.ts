import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';


/**
 * A dropdown where it is possible to filter the given items.
 */
@Component({
  selector: 'app-dropdown-with-filter',
  templateUrl: './dropdown-with-filter.component.html',
  styleUrls: ['./dropdown-with-filter.component.sass']
})
export class DropdownWithFilterComponent implements OnInit, OnChanges {

  /** The items in the dropdown */
  @Input() items: string[] = [];

  /** The items that remain after filtering */
  filteredItems: string[] = [];

  /** Keeps track if the dropdown is active (collapsed) */
  active: Boolean = false;


  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.items) {
      this.filteredItems = this.items;
    }

  }

  /**
   * Changes the filtered items to the given items
   * @param items: the new filtered items
   */
  changeFilteredItems(items: string[]) {
    this.filteredItems = items;
  }

}
