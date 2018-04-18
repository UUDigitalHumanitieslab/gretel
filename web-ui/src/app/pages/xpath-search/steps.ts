import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {of as observableOf} from 'rxjs/observable/of'
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {TreebankService} from "../../services/treebank.service";
import {ResultsService} from "../../services/results.service";
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

/**
 * All the information the xpath-search component should keep track of
 */
interface GlobalState {
    currentStep: Step;
    results: any[];
    selectedTreebanks: TreebankSelection;
    xpath: string;
    valid: boolean;
    loading: boolean;
}


/**
 * A step has a number and a function that performs the necessary actions when entering a step
 */
interface Step {
    number: number;
    // Makes sure the step is entered correctly
    enterStep(GlobalState): Observable<GlobalState>;
    leaveStep(GlobalState): GlobalState;
}


class XpathInputStep implements Step {

    constructor(public number: number) {}

    enterStep(state: GlobalState) {
        state.currentStep = this;
        return observableOf(state)
    }
    leaveStep(state: GlobalState){
        return state;
    }
}


class ResultStep implements Step {
    number: number;
    subscription: Subscription;

    constructor(stepNumber: number, private resultsService: ResultsService) {
        this.number = stepNumber;
    }

    /**
     * Gets the results before going the next state.
     * @param state
     * @returns
     */
    enterStep(state: GlobalState): Observable<GlobalState> {

        return new Observable((observer) => {

            this.subscription = this.resultsService.getAllResults(state.xpath, state.selectedTreebanks.corpus, state.selectedTreebanks.components, false).take(200).subscribe({ next: (res)=> {
                state.results.push(res);
            },
                complete: ()=>{
                    state.loading = false;
                }
            });

            state.currentStep = this
            state.results = [];
            state.loading = true;
            observer.next(state);
            observer.complete()
        })



    }

    /**
     * Makes sure the stream is ended
     * @param state
     * @returns {GlobalState}
     */
    leaveStep(state: GlobalState): GlobalState{
        this.subscription.unsubscribe();
        state.loading = false;
        return state;
    }


}


class SelectTreebankStep implements Step {
    number: number;

    constructor(stepNumber, private treebankService: TreebankService, private http: HttpClient) {
        this.number = stepNumber;
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
    leaveStep(state: GlobalState){
        return state;
    }
}


export {
    TreebankSelection,
    GlobalState,
    Step,
    XpathInputStep,
    SelectTreebankStep,
    ResultStep,
};
