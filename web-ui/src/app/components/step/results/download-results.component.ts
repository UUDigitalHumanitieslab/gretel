import { Component, Input, Output, EventEmitter } from '@angular/core';
import { faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'grt-download-results',
    templateUrl: './download-results.component.html',
    styleUrls: ['./download-results.component.scss']
})
export class DownloadResultsComponent {
    faDownload = faDownload;
    faInfoCircle = faInfoCircle;

    @Input()
    loading = false;

    @Output()
    downloadResults = new EventEmitter<boolean>();

    visible = false;
    includeNodeProperties = false;

    constructor() { }

    toggle() {
        this.visible = !this.visible;
    }

}
