import { Component, OnInit } from '@angular/core';
import {Link} from "./link";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})


export class NavigationComponent implements OnInit {

  links: Link[] = [
    {
      title: "home",
      name: "Home",
      link: "/home"
    },
    {
      title: "example-based-search",
      name: "Example-based search",
      link: "/example-based-search"
    },
    {
      title: "XPath-search",
      name: "XPath search",
      link: "/xpath-search"
    },
    {
      title: "documentation",
      name: "Documentation",
      link: "/documentation"
    }
  ]
  constructor() { }

  ngOnInit() {
  }

}

