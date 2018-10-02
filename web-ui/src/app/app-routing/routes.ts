/**
 * All the routes of the main pages
 */

import {HomePageComponent} from "../pages/home-page/home-page.component";
import {Route, Routes} from "@angular/router";
import {DocumentationComponent} from "../pages/documentation/documentation.component";
import {XpathSearchComponent} from "../pages/xpath-search/xpath-search.component";
import {ExampleBasedSearchComponent} from "../pages/example-based-search/example-based-search.component";

const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
    data: { index: '0' }
  },
  {
    path: 'example-based-search',
    component: ExampleBasedSearchComponent,
    data: { index: '1' }
  },
  {
    path: 'xpath-search',
    component: XpathSearchComponent,
    data: { index: '2' }
  },
  {
    path: 'documentation',
    component: DocumentationComponent,
    data: { index: '3' }
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

export {routes}

