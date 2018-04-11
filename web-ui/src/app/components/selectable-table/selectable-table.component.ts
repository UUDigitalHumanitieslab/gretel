import {Component, Input, OnInit} from '@angular/core';
import {TableColumn} from './TableColumn';

/** A table that becomes scrollable when it passes the height of the parent. To make sure this  */
@Component({
  selector: 'app-selectable-table',
  templateUrl: './selectable-table.component.html',
  styleUrls: ['./selectable-table.component.scss']
})
export class SelectableTable implements OnInit {

  /** The data to show in the tables */
  @Input() data: any;
  /** The columns of the table*/
  @Input() columns: TableColumn[];


  constructor() {
  }

  ngOnInit() {
  }


  changeSelected(row: any){
    row.selected = !row.selected;
  }



  changeAllSelected(e: any){
    if(e.currentTarget.checked){
      this.data.forEach((entry: any) => entry.selected = true)
    } else {
      this.data.forEach((entry: any) => entry.selected = false)
    }
  }

  isAllChecked(){
    if(!this.data){
      return false;
    }
    for(let entry of this.data){
      if(! entry.selected){
        return false;
      }
    }
    return true;
  }
}
