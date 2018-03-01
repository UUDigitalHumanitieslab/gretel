import { Component, OnInit } from '@angular/core';
import {FaListItem} from "../fa-list/fa-list-item";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  constructor() { }

  navigationItems: FaListItem[] = [
    {
      'htmlClass': 'fa-caret-right',
      'href': 'https://www.google.com',
      'content': 'Homepage Gretel',
    },
    {
      'htmlClass': 'fa-caret-right',
      'href': 'https://www.google.com',
      'content': 'Example-based search',
    },
    {
      'htmlClass': 'fa-caret-right',
      'href': 'https://www.google.com',
      'content': 'XPath search',
    },
    {
      'htmlClass': 'fa-caret-right',
      'href': 'https://www.google.com',
      'content': 'Documentation',
    }
  ];

  ngOnInit() {
  }

}
