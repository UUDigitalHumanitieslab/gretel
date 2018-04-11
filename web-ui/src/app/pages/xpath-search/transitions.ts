import {GlobalState, Step} from './steps'
import {Observable} from "rxjs/Observable";
interface Transition {
    name: string
    fire(state: GlobalState): Step
}

class Transitions {

    constructor(private transitions: Transition[]) {
    }

    fire(name: string, state: GlobalState): Observable<GlobalState> {
        let index = this.transitions.findIndex(transition => transition.name == name);
        let transition = this.transitions[index];
        if (transition != undefined) {
            let step = transition.fire(state);
            return step.enterStep(state)
        } else {
            throw Error('Could not find transition with name')
        }
    }
}

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
