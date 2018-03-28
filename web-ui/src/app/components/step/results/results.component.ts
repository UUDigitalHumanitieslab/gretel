import {Component, Input, OnChanges, OnInit, SimpleChange} from '@angular/core';
import {Result} from './result';
import {TableColumn} from '../../tables/selectable-table/TableColumn';

import * as $ from 'jquery';
import '../../../../assets/js/tree-visualizer';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit {


  @Input() results: Result[];
  @Input() loading: boolean;

  columns: any[] = [
    {field: 'number', header: '#' , width: '5%'},
    {field: 'id', header: 'ID', width: '10%'},
    {field: 'component', header: 'component', width: '15%'},
    {field: 'sentence', header: 'Sentence', width: '70%'},
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

  showTree(){
      let element: any = $('#output');
      element.treeVisualizer('assets/example_tree.xml', {nvFontSize: 14,normalView: false,
          initFSOnClick: true});
  }

}
