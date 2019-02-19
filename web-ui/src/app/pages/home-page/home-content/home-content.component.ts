import { Component, OnInit, Sanitizer, SecurityContext } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { ConfigurationService } from '../../../services/_index';

@Component({
    selector: 'grt-home-content',
    templateUrl: './home-content.component.html',
    styleUrls: ['./home-content.component.scss']
})
export class HomeContentComponent implements OnInit {

    constructor(private configurationService: ConfigurationService, private sanitizer: Sanitizer) { }

    async ngOnInit() {
    }
}
