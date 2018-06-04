import {NgModule} from '@angular/core';
import {RouterModule, Routes, Route} from '@angular/router';
import {routes} from "./routes";

@NgModule({
    imports: [
        RouterModule.forRoot(routes),
        RouterModule
    ],
    exports: [
        RouterModule,
    ],
    declarations: []
})
export class AppRoutingModule {
}
