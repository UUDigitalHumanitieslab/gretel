import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './animation';

@Component({
    selector: 'grt-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    animations: [
        slideInAnimation
    ]

})
export class AppComponent {
    prepareRoute(outlet: RouterOutlet) {
        const index = (outlet && outlet.isActivated && outlet.activatedRouteData['index']);
        return index;
    }
}
