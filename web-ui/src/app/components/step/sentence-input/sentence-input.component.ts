import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StepComponent } from "../step.component";

@Component({
    selector: 'grt-sentence-input',
    templateUrl: './sentence-input.component.html',
    styleUrls: ['./sentence-input.component.scss']
})
export class SentenceInputComponent extends StepComponent {
    @Output()
    public onChangeValue = new EventEmitter<string>();
    @Input()
    public inputSentence: string;

    constructor() {
        super();
    }

    showWarning() {
        this.warning = true;
    }

    inputChanges(event) {
        this.onChangeValue.emit(event.target.value);
        this.updateValidity(event.target.value);
    }

    public updateValidity(sentence = this.inputSentence) {
        this.valid = sentence.trim().length != 0;
        this.onChangeValid.emit(this.valid);
    }
}
