import { Component } from '@angular/core';
import { environment } from './../../../../environments/environment';

@Component({
    selector: 'grt-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
    buildTime: string;
    version: string;
    sourceUrl: string;

    constructor() {
        this.buildTime = environment.buildTime;
        this.version = environment.version;
        this.sourceUrl = environment.sourceUrl;
    }
}
