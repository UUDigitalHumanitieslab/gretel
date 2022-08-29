import { Component, ViewChild, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { OverlayPanel } from 'primeng/overlaypanel';
import { faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'grt-download-results',
    templateUrl: './download-results.component.html',
    styleUrls: ['./download-results.component.scss']
})
export class DownloadResultsComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[];

    faDownload = faDownload;
    faInfoCircle = faInfoCircle;

    @ViewChild(OverlayPanel, { static: true })
    overlayPanel: OverlayPanel;

    @Input()
    loading = false;

    @Output()
    downloadResults = new EventEmitter<boolean>();

    visible = false;
    includeNodeProperties = false;

    constructor() { }

    toggle($event: any) {
        this.overlayPanel.toggle($event);
    }

    ngOnInit(): void {
        this.subscriptions = [
            this.overlayPanel.onShow.subscribe(() => this.visible = true),
            this.overlayPanel.onHide.subscribe(() => this.visible = false)];
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
