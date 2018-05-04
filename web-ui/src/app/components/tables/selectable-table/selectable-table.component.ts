import {Component, EventEmitter, Input, OnInit, Output,} from '@angular/core';
import {TableColumn} from './TableColumn';

@Component({
  selector: 'grt-selectable-table',
  templateUrl: './selectable-table.component.html',
  styleUrls: ['./selectable-table.component.scss']
})
export class SelectableTable implements OnInit {

  /** The data to show in the tables */
  @Input() data: any;
  /** The columns of the table*/
  @Input() columns: TableColumn[];
  @Output() onSelect = new EventEmitter<any>();



  constructor() {
  }

  ngOnInit() {
  }


  changeSelected(row: any){
    row.selected = !row.selected;
    this.onSelect.emit();
  }



  changeAllSelected(e: any){
    if(e.currentTarget.checked){
      this.data.forEach((entry: any) => entry.selected = true)

    } else {
      this.data.forEach((entry: any) => entry.selected = false)
    }
      this.onSelect.emit();
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
