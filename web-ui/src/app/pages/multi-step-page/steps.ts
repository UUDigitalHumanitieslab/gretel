import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { of as observableOf } from 'rxjs/observable/of'
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TreebankService } from "../../services/treebank.service";
import { ResultsService } from "../../services/results.service";
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/takeUntil';
import { AlpinoService } from "../../services/_index";
import { XPathModels } from "ts-xpath";
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
    currentStep: Step<this>;
    /**
     * Include context in results (the preceding and following sentence)
     */
    retrieveContext: boolean,
    selectedTreebanks: TreebankSelection;
    xpath: string;
    valid: boolean;
    // Question: should this even be in this state?
    loading: boolean;
    inputSentence?: string;
}

interface GlobalStateExampleBased extends GlobalState {
    isCustomXPath: boolean,
    exampleXml: string,
    subTreeXml: string,
    tokens: string[],
    attributes: string[],
    /**
     * Ignores properties of the dominating node
     */
    ignoreTopNode: boolean,
    /**
     * Respect word order
     */
    respectOrder: boolean
}




/**
 * A step has a number and a function that performs the necessary actions when entering a step
 */
class Step<T> {


    constructor(public number: number) {

    }

    // Makes sure the step is entered correctly
    enterStep(GlobalState): Observable<T> {
        throw Error('Not implemented');
    };

    leaveStep(GlobalState): T {
        throw Error('Not implemented')
    };
}

class SentenceInputStep<T extends GlobalState> extends Step<T> {


    enterStep(state: T) {
        state.currentStep = this;
        return observableOf(state)
    }

    leaveStep(state: T) {
        return state;
    }
}

class MatrixStep extends Step<GlobalStateExampleBased> {
    constructor(number: number, private alpinoService: AlpinoService) {
        super(number)
    }

    enterStep(state: GlobalStateExampleBased): Observable<GlobalStateExampleBased> {
        return new Observable((observer) => {
            state.currentStep = this;
            state.tokens = this.alpinoService.tokenize(state.inputSentence).split(' ');
            state.attributes = state.tokens.map(t => 'pos'); // default value
            this.updateMatrix(state).then(newState => {
                observer.next(newState);
                observer.complete();
            });
        });
    }

    leaveStep(state: GlobalStateExampleBased) {
        return state;
    }

    async updateMatrix(state: GlobalStateExampleBased) {
        state.loading = true;
        if (!state.isCustomXPath) {
            let generated = await this.alpinoService.generateXPath(
                state.exampleXml,
                state.tokens,
                state.attributes,
                state.ignoreTopNode,
                state.respectOrder);
            state.subTreeXml = generated.subTree;
            state.xpath = generated.xpath;
            state.valid = true;
        }
        // TODO: validate custom XPATH!
        state.loading = false;
        return state;
    }
}

class ParseStep extends Step<GlobalStateExampleBased> {
    constructor(number: number, private alpinoService: AlpinoService) {
        super(number);
    }

    enterStep(state: GlobalStateExampleBased): Observable<GlobalStateExampleBased> {
        state.loading = true;
        return new Observable((observer) => {
            state.currentStep = this;
            this.alpinoService.parseSentence(state.inputSentence).then(xml => {
                state.exampleXml = xml;
                state.loading = false;
                observer.next(state);
                observer.complete();
            });
        });
    }

    leaveStep(state: GlobalStateExampleBased) {
        return state;
    }
}

class XpathInputStep<T extends GlobalState> extends Step<T> {
    constructor(number: number) {
        super(number);
    }

    enterStep(state: T) {
        state.currentStep = this;
        return observableOf(state)
    }

    leaveStep(state: T) {
        return state;
    }
}

class AnalysisStep<T extends GlobalState> extends Step<T>{
    constructor(number: number) {
        super(number);
    }

    /**
     * Gets the results before going the next state.
     * @param state
     * @returns
     */
    enterStep(state: T): Observable<T> {
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
    leaveStep(state: T): T {
        state.loading = false;
        return state;
    }
}

class ResultStep<T extends GlobalState> extends Step<T>{
    constructor(number: number) {
        super(number);
    }

    /**
     * Gets the results before going the next state.
     * @param state
     * @returns
     */
    enterStep(state: T): Observable<T> {
        return new Observable((observer) => {
            state.currentStep = this;
            state.valid = true;
            observer.next(state);
            observer.complete();
        });
    }

    /**
     * Makes sure the stream is ended
     * @param state
     * @returns {T}
     */
    leaveStep(state: T): T {
        state.loading = false;
        return state;
    }
}

class SelectTreebankStep<T extends GlobalState> extends Step<T> {
    constructor(public number: number) {
        super(number);
    }

    /**
     * Must first do a pre treebank step
     * @param state
     * @returns the updates state
     */

    enterStep(state: T): Observable<T> {
        return new Observable((observer) => {
            state.currentStep = this;
            state.valid = false;
            state.selectedTreebanks = {
                corpus: state.selectedTreebanks ? state.selectedTreebanks.corpus : undefined,
                components: state.selectedTreebanks ? state.selectedTreebanks.components : undefined
            }
            observer.next(state);
            observer.complete();
        });
    }

    leaveStep(state: T) {
        return state;
    }
}


export {
    TreebankSelection,
    GlobalState,
    GlobalStateExampleBased,
    Step,
    AnalysisStep,
    XpathInputStep,
    SelectTreebankStep,
    ResultStep,
    SentenceInputStep,
    ParseStep,
    MatrixStep
};
