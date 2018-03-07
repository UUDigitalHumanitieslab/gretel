import { Component, OnInit } from '@angular/core';
import {mainRoutes, RouteWrapper} from "../../../routes";

@Component({
  selector: 'app-footer-navigation',
  templateUrl: './footer-navigation.component.html',
  styleUrls: ['./footer-navigation.component.scss']
})
export class FooterNavigationComponent implements OnInit {

  constructor() { }

  links: RouteWrapper[] = mainRoutes;

  ngOnInit() {
  }

}
