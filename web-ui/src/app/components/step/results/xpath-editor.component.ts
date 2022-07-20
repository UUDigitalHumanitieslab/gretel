import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ValueEvent } from 'lassy-xpath';

@Component({
  selector: 'grt-results-xpath-editor',
  templateUrl: './xpath-editor.component.html',
  styleUrls: ['./xpath-editor.component.scss']
})
export class ResultsXpathEditorComponent {
    @Input()
    public xpath: string;

    @Output()
    public changeXpath = new EventEmitter<string>();

    public isModifyingXPath = false;
    public xpathCopied = false;
    public customXPath: string;
    public validXPath = true;

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
