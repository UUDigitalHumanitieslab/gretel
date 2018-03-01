import {Component, Input, OnInit} from '@angular/core';
import {FaListItem} from "./fa-list-item";

@Component({
  selector: 'app-fa-list',
  templateUrl: './fa-list.component.html',
  styleUrls: ['./fa-list.component.scss']
})
export class FaListComponent implements OnInit {

  constructor() {
  }

  @Input() items: FaListItem[];

  ngOnInit() {
  }

}
