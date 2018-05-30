import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { of as observableOf } from 'rxjs/observable/of'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TreebankService } from "../../services/treebank.service";
import { ResultsService } from "../../services/results.service";
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
/**
 * Contains all the steps that are used in the xpath search
 */


/**
 * Info that needs to be in a treebank selection
 */
interface TreebankSelection {
    corpus: string
    components: string[]
}


// TODO: make multiple types of states (One for XPath search and one for Example Based Search)
/**
 * All the information the xpath-search component should keep track of
 */
interface GlobalState {
    currentStep: Step;
    selectedTreebanks: TreebankSelection;
    xpath: string;
    valid: boolean;
    // Question: should this even be in this state?
    loading: boolean;
    inputSentence?: string;
}




/**
 * A step has a number and a function that performs the necessary actions when entering a step
 */
class Step {


    constructor(public number: number) {

    }

    // Makes sure the step is entered correctly
    enterStep(GlobalState): Observable<GlobalState> {
        throw Error('Not implemented');
    };

    leaveStep(GlobalState): GlobalState {
        throw Error('Not implemented')
    };
}

class SentenceInputStep extends Step {


    enterStep(state: GlobalState) {
        state.currentStep = this;
        return observableOf(state)
    }

    leaveStep(state: GlobalState) {
        return state;
    }
}

class MatrixStep extends Step {
    enterStep(state: GlobalState) {
        state.currentStep = this;
        return observableOf(state)
    }

    leaveStep(state: GlobalState) {
        return state;
    }
}

class ParseStep extends Step {

    enterStep(state: GlobalState) {
        state.currentStep = this;
        return observableOf(state);
    }
    leaveStep(state: GlobalState) {
        return state;
    }

}

class XpathInputStep extends Step {


    enterStep(state: GlobalState) {
        state.currentStep = this;
        return observableOf(state)
    }

    leaveStep(state: GlobalState) {
        return state;
    }
}

class AnalysisStep extends Step {
    number: number;

    constructor(number: number) {
        super(number);
    }

    /**
     * Gets the results before going the next state.
     * @param state
     * @returns
     */
    enterStep(state: GlobalState): Observable<GlobalState> {
        return new Observable((observer) => {
            state.currentStep = this;

            observer.next(state);
            observer.complete();
        });
    }

    /**
     * Makes sure the stream is ended
     * @param state
     * @returns {GlobalState}
     */
    leaveStep(state: GlobalState): GlobalState {
        state.loading = false;
        return state;
    }
}

class ResultStep extends Step {
    number: number;

    constructor(number: number) {
        super(number);
    }

    /**
     * Gets the results before going the next state.
     * @param state
     * @returns
     */
    enterStep(state: GlobalState): Observable<GlobalState> {
        return new Observable((observer) => {
            state.currentStep = this;

            observer.next(state);
            observer.complete();
        });
    }

    /**
     * Makes sure the stream is ended
     * @param state
     * @returns {GlobalState}
     */
    leaveStep(state: GlobalState): GlobalState {
        state.loading = false;
        return state;
    }
}

class SelectTreebankStep extends Step {


    constructor(public number: number) {
        super(number);
    }

    /**
     * Must first do a pre treebank step
     * @param state
     * @returns the updates state
     */
    enterStep(state: GlobalState): Observable<GlobalState> {

        return new Observable((observer) => {
            state.currentStep = this;
            state.valid = false;
            observer.next(state);
            observer.complete();


        });
    }

    leaveStep(state: GlobalState) {
        return state;
    }
}


export {
    TreebankSelection,
    GlobalState,
    Step,
    AnalysisStep,
    XpathInputStep,
    SelectTreebankStep,
    ResultStep,
    SentenceInputStep,
    ParseStep,
    MatrixStep
};
