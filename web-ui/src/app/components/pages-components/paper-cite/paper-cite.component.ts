import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-paper-cite',
  templateUrl: './paper-cite.component.html',
  styleUrls: ['./paper-cite.component.scss']
})
export class PaperCiteComponent implements OnInit {

    @Input() href: string;
  constructor() { }

  ngOnInit() {
  }

}
