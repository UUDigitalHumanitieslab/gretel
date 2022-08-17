import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ValueEvent } from 'lassy-xpath';
import { ClipboardService } from 'ngx-clipboard';
import { DownloadService, NotificationService } from '../../../services/_index';

@Component({
    selector: 'grt-results-xpath-editor',
    templateUrl: './xpath-editor.component.html',
    styleUrls: ['./xpath-editor.component.scss']
})
export class ResultsXpathEditorComponent {
    @Input()
    public xpath: string;

    @Input()
    public activeFilterCount: number;

    @Input()
    public inputSentence: string;

    @Output()
    public addFiltersXPath = new EventEmitter<void>();

    @Output()
    public changeXpath = new EventEmitter<string>();

    public isModifyingXPath = false;
    public xpathCopied = false;
    public customXPath: string;
    public validXPath = true;

    constructor(private clipboardService: ClipboardService,
        private downloadService: DownloadService,
        private notificationService: NotificationService) {
    }

    public copyXPath() {
        if (this.clipboardService.copyFromContent(this.xpath)) {
            this.xpathCopied = true;
            const notification = this.notificationService.add('Copied to clipboard!', 'success');
            setTimeout(() => {
                this.xpathCopied = false;
                this.notificationService.cancel(notification);
            }, 5000);
        }
    }

    public downloadXPath() {
        this.downloadService.downloadXPath(this.xpath);
    }

    public editXPath() {
        this.isModifyingXPath = true;
    }

    public updateXPath() {
        if (this.validXPath) {
            this.changeXpath.next(this.customXPath);
            this.isModifyingXPath = false;
        }
    }

    public resetXPath() {
        this.isModifyingXPath = false;
    }

    public changeCustomXpath(valueEvent: ValueEvent) {
        this.validXPath = !valueEvent.error;
        if (this.validXPath) {
            this.customXPath = valueEvent.xpath;
        }
    }
}
