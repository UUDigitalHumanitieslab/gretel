import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfigurationService } from '../../../services/_index';

@Component({
    selector: 'grt-home-content',
    templateUrl: './home-content.component.html',
    styleUrls: ['./home-content.component.scss']
})
export class HomeContentComponent implements OnInit {
    public uploadUrl: SafeHtml;

    constructor(private configurationService: ConfigurationService, private sanitizer: DomSanitizer) { }

    async ngOnInit() {
        this.uploadUrl = this.sanitizer.sanitize(SecurityContext.URL, await this.configurationService.getUploadApiUrl('../../'));
    }
}
