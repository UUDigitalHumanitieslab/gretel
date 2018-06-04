/**
 * A step component is a component that should be inherited from
 * It is used to give a outline of how a step in a multi-step process should look
 * This component is used as parent for the steps in the xpath-search page
 */
import { Component, EventEmitter, Output } from '@angular/core';

export abstract class StepComponent {
    warning: boolean = false;
    valid = false;

    constructor() {

    }

    @Output() onChangeValid = new EventEmitter<Boolean>();

    /**
     * Check if the input of the user is valid
     */
    public abstract updateValidity();

    /**
     * Gives an warning that helps the user to understand why the current input is not valid
     */
    public abstract showWarning();
}
