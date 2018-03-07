import { Component, OnInit } from '@angular/core';
import {mainRoutes, RouteWrapper} from "../../../routes";

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})



export class NavigationComponent implements OnInit {
  links: RouteWrapper[] = mainRoutes;


  constructor() { }

  ngOnInit() {
  }

}

