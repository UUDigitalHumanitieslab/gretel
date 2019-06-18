/**
 * A step component is a component that should be inherited from
 * It is used to give a outline of how a step in a multi-step process should look
 * This component is used as parent for the steps in the xpath-search page
 */
import { EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '../../services/_index';
import { StepType, GlobalState } from '../../pages/multi-step-page/steps';

export abstract class StepComponent<T extends GlobalState> implements OnInit, OnDestroy {
    public abstract stepType: StepType;

    public valid = false;

    constructor(private stateService: StateService<T>) {
    }

    @Output() changeValid = new EventEmitter<Boolean>();

    /**
     * Gives an warning that helps the user to understand why the current input is not valid
     *
     * @returns a message explaining the situation, or nothing when the component will show
     * the feedback itself.
     */
    public abstract getWarningMessage(): string | void;

    ngOnInit() {
        this.stateService.subscribe(this);
    }

    ngOnDestroy() {
    }
}
