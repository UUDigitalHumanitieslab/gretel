import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GlobalState, Step } from './steps';

@Component({
    selector: 'grt-step-buttons',
    templateUrl: './step-buttons.component.html'
})
export class StepButtonsComponent {
    @Input()
    public currentStep: Step<GlobalState>;

    @Input()
    public steps: Step<GlobalState>[];

    @Output()
    public prev = new EventEmitter();

    @Output()
    public next = new EventEmitter();
}
