import {GlobalState, Step} from './steps'
import {Observable} from "rxjs/Observable";

/**
 * This file contains transitions for a state machine. A transition is used to determine the next step to go to,
 * given the global state and the event that is triggered
 */


interface Transition {
    /**
     * Name of the transition, is used to determine if a transition should fire
     */
    name: string

    /**
     * Performs the transition. Determines the next step based on the globalState
     * @param state
     */
    fire(state: GlobalState): Step
}

/***
 * Class that keeps track of all the transitions
 */
class Transitions {

    constructor(private transitions: Transition[]) {
    }

    fire(name: string, state: GlobalState): Observable<GlobalState> {
        let index = this.transitions.findIndex(transition => transition.name == name);
        let transition = this.transitions[index];
        if (transition != undefined) {
            let step = transition.fire(state);
            //Leave the current state
            state = state.currentStep.step.leaveStep(state);
            //Enter the new state

            return step.enterStep(state)
        } else {
            throw Error('Could not find transition with name')
        }
    }
}

/**
 * Transition that decreases the current step number (if possible)
 */
class DecreaseTransition implements Transition {
    name = 'decrease';
    constructor(private steps: Step[]){}
    fire(state: GlobalState) {
        if (state.currentStep.number == 0) {
            return state.currentStep.step
        } else {
            return this.steps[state.currentStep.number - 1]
        }
    }
}
/**
 * Transition that increases the current step number (if possible)
 */
class IncreaseTransition implements Transition {
    name = 'increase';
    constructor(private steps: Step[]) {}
    fire(state: GlobalState) {
        if (state.currentStep.number == this.steps.length) {
            return state.currentStep.step
        } else {
            return this.steps[state.currentStep.number + 1]
        }
    }
}


export {
    Transition,
    Transitions,
    IncreaseTransition,
    DecreaseTransition
}
