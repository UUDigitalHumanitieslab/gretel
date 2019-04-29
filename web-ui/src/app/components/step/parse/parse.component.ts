import { Component, Input, EventEmitter, Output } from '@angular/core';
import { StepComponent } from '../step.component';

@Component({
    selector: 'grt-parse',
    templateUrl: './parse.component.html',
    styleUrls: ['./parse.component.scss']
})
export class ParseComponent extends StepComponent {
    @Input() public loading = true;
    @Input() public sentence: string;
    @Input() public xml: string;
    @Output() public changeXml = new EventEmitter<string>();

    public display = 'inline';
    public validationMessage?: string;

    constructor() {
        super();
    }

    public getValidationMessage(): string | void {
        this.validationMessage = `Error parsing sentence: ${this.sentence}`; // we display our own error
    }

    public updateValidity() {
        this.changeValid.emit(this.valid);
    }
}
