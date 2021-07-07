import {NgModule} from '@angular/core';
import {RouterModule, Routes, Route} from '@angular/router';
import {routes} from "./routes";

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
        RouterModule
    ],
    exports: [
        RouterModule,
    ],
    declarations: []
})
export class AppRoutingModule {
}
