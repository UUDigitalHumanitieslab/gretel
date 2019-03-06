import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StepComponent } from '../step.component';

@Component({
    selector: 'grt-sentence-input',
    templateUrl: './sentence-input.component.html',
    styleUrls: ['./sentence-input.component.scss']
})
export class SentenceInputComponent extends StepComponent {
    @Output()
    public changeValue = new EventEmitter<string>();

    @Output()
    public next = new EventEmitter();

    @Input()
    public inputSentence: string;

    constructor() {
        super();
    }

    public getValidationMessage() {
        this.warning = true;
    }

    inputChanges(event: Event) {
        this.changeValue.emit((event.target as HTMLInputElement).value);
        this.updateValidity((event.target as HTMLInputElement).value);
    }

    public updateValidity(sentence = this.inputSentence) {
        this.valid = sentence.trim().length != 0;
        this.onChangeValid.emit(this.valid);
    }
}
