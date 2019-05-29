import { Component, Input, EventEmitter, Output } from '@angular/core';
import { StepComponent } from '../step.component';
import { StateService } from '../../../services/_index';
import { GlobalStateExampleBased, StepType } from '../../../pages/multi-step-page/steps';

@Component({
    selector: 'grt-parse',
    templateUrl: './parse.component.html',
    styleUrls: ['./parse.component.scss']
})
export class ParseComponent extends StepComponent<GlobalStateExampleBased> {
    @Input() public loading = true;
    @Input() public sentence: string;
    @Input() public xml: string;
    @Output() public changeXml = new EventEmitter<string>();

    public display = 'inline';
    public stepType = StepType.Parse;
    public warning?: string;

    constructor(stateService: StateService<GlobalStateExampleBased>) {
        super(stateService);
    }

    public getWarningMessage(): string | void {
        this.warning = `Error parsing sentence: ${this.sentence}`; // we display our own error
    }
}
