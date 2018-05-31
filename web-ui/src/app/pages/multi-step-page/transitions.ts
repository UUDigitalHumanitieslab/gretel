import {GlobalState, Step} from './steps'
import {Observable} from "rxjs/Observable";

/**
 * This file contains transitions for a state machine. A transition is used to determine the next step to go to,
 * given the global state and the event that is triggered
 */


interface Transition<T extends GlobalState> {
    /**
     * Name of the transition, is used to determine if a transition should fire
     */
    name: string

    /**
     * Performs the transition. Determines the next step based on the globalState
     * @param state
     */
    fire(state: T): Step<T>
}

/***
 * Class that keeps track of all the transitions
 */
class Transitions<T extends GlobalState> {
    constructor(private transitions: Transition<T>[]) {}

    /**
     * Fires a transition and creates the new state
     * @param name: the name of the transition to fire
     * @param state: the current state
     * @returns {Observable<T>} an observable that returns a new state.
     */
    fire(name: string, state: T): Observable<T> {
        let index = this.transitions.findIndex(transition => transition.name == name);
        let transition = this.transitions[index];
        if (transition != undefined) {
            let step = transition.fire(state);
            state = state.currentStep.leaveStep(state);
            return step.enterStep(state)
        } else {
            throw Error(`Could not find transition with name: ${name}`)
        }
    }
}

/**
 * Transition that decreases the current step number (if possible)
 */
class DecreaseTransition<T extends GlobalState> implements Transition<T> {
    name = 'decrease';
    constructor(private steps: Step<T>[]){}
    fire(state: T) {
        if (state.currentStep.number == 0) {
            return state.currentStep
        } else {
            return this.steps[state.currentStep.number - 1]
        }
    }
}
/**
 * Transition that increases the current step number (if possible)
 */
class IncreaseTransition<T extends GlobalState> implements Transition<T> {
    name = 'increase';
    constructor(private steps: Step<T>[]) {}
    fire(state: T) {
        if (state.currentStep.number == this.steps.length) {
            return state.currentStep
        } else {
            return this.steps[state.currentStep.number + 1]
        }
    }
}


class JumpToStepTransition<T extends GlobalState> implements Transition<T>{
    name = 'jumpTo';
    constructor(private step: Step<T>){
        this.name = `jumpTo_${this.step.number}`
    }

    fire(state: T){
        if(state.currentStep.number > this.step.number){
            return this.step
        } else {
            return state.currentStep
        }
    }

}


export {
    Transition,
    Transitions,
    IncreaseTransition,
    DecreaseTransition,
    JumpToStepTransition,
}
