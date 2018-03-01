import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {HomePageComponent} from "../pages/home-page/home-page.component";
import {DocumentationComponent} from "../pages/documentation/documentation.component";


const routes: Routes = [
  {
    path: '',
    component: HomePageComponent
  },
  {
    path: 'documentation',
    component: DocumentationComponent
  },
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
