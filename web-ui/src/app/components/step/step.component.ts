/**
 * A step component is a component that should be inherited from
 * It is used to give a outline of how a step in a multi-step process should look
 * This component is used as parent for the steps in the xpath-search page
 */
import { Component, EventEmitter, Output } from '@angular/core';

export abstract class StepComponent {
    warning = false;
    valid = false;

    constructor() {

    }

    @Output() changeValid = new EventEmitter<Boolean>();

    /**
     * Check if the input of the user is valid
     */
    public abstract updateValidity();

    /**
     * Gives an warning that helps the user to understand why the current input is not valid
     *
     * @returns a message explaining the situation, or nothing when the component will show
     * the feedback itself.
     */
    public abstract getValidationMessage(): string | void;
}
