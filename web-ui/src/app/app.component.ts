import { Component } from '@angular/core';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'grt-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    faCheck = faCheck;
    faTimes = faTimes;

    title = 'app';
}
