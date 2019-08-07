import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ResultsComponent } from './results.component';
import { OverlayPanel } from 'primeng/overlaypanel';
import { Subscription } from 'rxjs';

@Component({
    selector: 'grt-download-results',
    templateUrl: './download-results.component.html',
    styleUrls: ['./download-results.component.scss']
})
export class DownloadResultsComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[];

    @ViewChild(OverlayPanel, { static: true })
    overlayPanel: OverlayPanel;

    visible = false;
    includeNodeProperties = false;

    constructor(private resultsComponent: ResultsComponent) { }

    downloadResults() {
        this.resultsComponent.downloadResults(this.includeNodeProperties);
    }

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
