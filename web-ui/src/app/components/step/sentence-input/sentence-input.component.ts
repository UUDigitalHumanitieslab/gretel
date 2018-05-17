import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {StepComponent} from "../step.component";

@Component({
    selector: 'grt-sentence-input',
    templateUrl: './sentence-input.component.html',
    styleUrls: ['./sentence-input.component.scss']
})
export class SentenceInputComponent extends StepComponent implements OnInit {
    @Output() onChangeValue = new EventEmitter<string>();

    constructor() {
        super();
    }

    ngOnInit() {
        //Add the moment it is always valid
        this.onChangeValid.emit(true);
    }

    showWarning() {
        this.warning = true;
    }

    inputChanges(event){
        this.valid = event.target.value.length != 0;
        this.onChangeValue.emit(event.target.value);
        this.onChangeValid.emit(this.valid);

    }

}
