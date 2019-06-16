import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ResultsComponent } from './results.component';
import { OverlayPanel } from 'primeng/primeng';
import { Subscription } from 'rxjs';

@Component({
    selector: 'grt-download-results',
    templateUrl: './download-results.component.html',
    styleUrls: ['./download-results.component.scss']
})
export class DownloadResultsComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription[];
    visible = false;

    @ViewChild(OverlayPanel)
    overlayPanel: OverlayPanel;

    constructor(private resultsComponent: ResultsComponent) { }

    downloadResults() {
        this.resultsComponent.downloadResults();
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
