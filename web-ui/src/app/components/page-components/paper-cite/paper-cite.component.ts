/**
 * Component that can be used to cite a paper
 */
import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'grt-paper-cite',
  templateUrl: './paper-cite.component.html',
  styleUrls: ['./paper-cite.component.scss']
})
export class PaperCiteComponent implements OnInit {

    @Input() href: string;
  constructor() { }

  ngOnInit() {
  }

}
