/**
 * All the routes of the main pages
 */

import {HomePageComponent} from "../pages/home-page/home-page.component";
import {Route, Routes} from "@angular/router";
import {DocumentationComponent} from "../pages/documentation/documentation.component";
import {XpathSearchComponent} from "../pages/xpath-search/xpath-search.component";


const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'example-based-search',
    component: DocumentationComponent,
  },
  {
    path: 'xpath-search',
    component: XpathSearchComponent,
  },
  {
    path: 'documentation',
    component: DocumentationComponent,
  },

  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }


];


export {routes}
