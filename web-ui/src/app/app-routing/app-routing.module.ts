import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomePageComponent} from "../pages/home-page/home-page.component";
import {DocumentationComponent} from "../pages/documentation/documentation.component";


const routes: Routes = [
  {
    path: 'home',
    component: HomePageComponent
  },
  {
    path: 'documentation',
    component: DocumentationComponent
  },
  {
    path: 'example-based-search',
    component: HomePageComponent
  },
  {
    path: 'xpath-search',
    component: HomePageComponent
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {enableTracing: true})
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
