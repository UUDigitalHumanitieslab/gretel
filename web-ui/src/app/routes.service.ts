import { Injectable } from '@angular/core';
import {Route} from "@angular/router";

interface CustomRoute{
  name: string
  link: string
  route: Route
}

@Injectable()
export class RoutesService {

  constructor() { }

  routes: CustomRoute[] [
    {
      name: "home",
      link: "/home",
      route: {

      }
    }
  ];

  getRoutes(){
    return this.routes
  }

}
