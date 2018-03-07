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
      htmlClass: 'fa-caret-right',
      title: "home",
      name: "Home",
      link: "/home"
    },
    {
      htmlClass: 'fa-caret-right',
      title: "example-based-search",
      name: "Example-based search",
      link: "/example-based-search"
    },
    {
      htmlClass: 'fa-caret-right',
      title: "XPath-search",
      name: "XPath search",
      link: "/xpath-search"
    },
    {
      htmlClass: 'fa-caret-right',
      title: "documentation",
      name: "Documentation",
      link: "/documentation"
    }
  ];

  ngOnInit() {
  }

}
