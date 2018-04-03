import { NgModule } from '@angular/core';
import { RouterModule, Routes, Route } from '@angular/router';
import {HomePageComponent} from "../pages/home-page/home-page.component";
import {DocumentationComponent} from "../pages/documentation/documentation.component";
import {routes} from "../routes";

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
