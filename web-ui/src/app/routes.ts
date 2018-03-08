import {HomePageComponent} from "./pages/home-page/home-page.component";
import {Route, Routes} from "@angular/router";
import {DocumentationComponent} from "./pages/documentation/documentation.component";
import {XPathSearchComponent} from "./pages/x-path-search/x-path-search.component";





const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'home',
    component: HomePageComponent,
  },
  {
    path: 'example-based-search',
    component: DocumentationComponent,
  },
  {
    path: 'x-path-search',
    component: XPathSearchComponent,
  },
  {
    path: 'documentation',
    component: DocumentationComponent,
  },


];


export {routes}

