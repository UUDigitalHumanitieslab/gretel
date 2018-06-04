import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { StepComponent } from "../step.component";
import { MacroService, ValueEvent } from 'lassy-xpath/ng';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'grt-xpath-input',
    templateUrl: './xpath-input.component.html',
    styleUrls: ['./xpath-input.component.scss']
})
export class XpathInputComponent extends StepComponent {
    @Input()
    public value: string;

    @Input()
    public retrieveContext: boolean;

    @Output()
    public onChangeValue = new EventEmitter<string>();

    @Output()
    public onChangeRetrieveContext = new EventEmitter<boolean>();

    constructor(private httpClient: HttpClient, macroService: MacroService) {
        super();

        macroService.loadDefault();
    }

    valid: boolean = false;

    updateValidity() {
        this.onChangeValid.emit(this.valid);
    }

    getValidationMessage() {
        this.warning = true;
    }

    inputChanged(event: ValueEvent) {
        this.valid = !event.error;
        this.value = event.xpath;
        this.onChangeValue.emit(this.value);
        this.onChangeValid.emit(this.valid);
    }

    emitRetrieveContextChanged() {
        this.onChangeRetrieveContext.emit(this.retrieveContext);
    }
}
