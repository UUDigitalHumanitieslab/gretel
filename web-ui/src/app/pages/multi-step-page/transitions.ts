import { GlobalState, Step } from './steps';

/**
 * This file contains transitions for a state machine. A transition is used to determine the next step to go to,
 * given the global state and the event that is triggered
 */
interface Transition<T extends GlobalState> {
    /**
     * Name of the transition, is used to determine if a transition should fire
     */
    name: string;

    /**
     * Performs the transition. Determines the next step based on the globalState
     * @param state
     */
    fire(state: T): Promise<T>;
}

/***
 * Class that keeps track of all the transitions
 */
class Transitions<T extends GlobalState> {
    constructor(private transitions: Transition<T>[]) { }

    /**
     * Fires a transition and creates the new state
     * @param name: the name of the transition to fire
     * @param state: the current state
     * @returns {Promise<T>} containing a new state.
     */
    async fire(name: string, state: T): Promise<T> {
        let index = this.transitions.findIndex(transition => transition.name == name);
        let transition = this.transitions[index];
        if (transition != undefined) {
            return transition.fire(state);
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
    constructor(private steps: Step<T>[]) { }
    async fire(state: T) {
        if (state.currentStep.number == 0) {
            return state;
        } else {
            state.currentStep.leaveStep(state);
            return this.steps[state.currentStep.number - 1].enterStep(state);
        }
    }
}

/**
 * Transition that increases the current step number (if possible)
 */
class IncreaseTransition<T extends GlobalState> implements Transition<T> {
    name = 'increase';
    constructor(private steps: Step<T>[]) { }
    async fire(state: T) {
        if (state.currentStep.number == this.steps.length) {
            return state;
        } else {
            state.currentStep.leaveStep(state);
            return this.steps[state.currentStep.number + 1].enterStep(state);
        }
    }
}

class JumpToStepTransition<T extends GlobalState> implements Transition<T>{
    name = 'jumpTo';
    constructor(private steps: Step<T>[], private number: number) {
        this.name = `jumpTo_${this.number}`
    }

    async fire(state: T) {
        // don't modify the original state
        // (otherwise the interface might display the intermediate components)
        state = Object.assign({}, state);

        if (!state.currentStep) {
            // no step yet, start at the first one
            state = await this.steps[0].enterStep(state);
        }

        if (state.currentStep.number > this.number) {
            // jumping backwards is always fine
            state.currentStep.leaveStep(state);
            return this.steps[this.number].enterStep(state);
        }

        while (state.currentStep.number < this.number && state.valid) {
            state.currentStep.leaveStep(state);
            state = await this.steps[state.currentStep.number + 1].enterStep(state);
        }

        return state;
    }
}

export {
    Transition,
    Transitions,
    IncreaseTransition,
    DecreaseTransition,
    JumpToStepTransition,
}
