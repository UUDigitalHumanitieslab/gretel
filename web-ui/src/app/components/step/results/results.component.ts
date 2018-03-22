import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {Result} from './result';
import {TableColumn} from '../../tables/selectable-table/TableColumn';


@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {


  @Input() results: Result[];
  @Input() loading: boolean;

  columns: TableColumn[] = [
    {field: 'number', header: '#'},
    {field: 'id', header: 'ID'},
    {field: 'component', header: 'component'},
    {field: 'sentence', header: 'Sentence'},
  ];

  items: string[] = [
    'item1',
    'item2',
    'item3'
  ];


  constructor() {
  }

  ngOnInit() {
  }




}
