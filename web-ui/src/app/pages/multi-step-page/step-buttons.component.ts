import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'grt-step-buttons',
    templateUrl: './step-buttons.component.html'
})
export class StepButtonsComponent {
    @Input()
    public currentStep: number;

    @Input()
    public steps: number;

    @Output()
    public prev = new EventEmitter();

    @Output()
    public next = new EventEmitter();
}
