import {Observable} from "rxjs/Observable";
import {of as observableOf} from 'rxjs/observable/of'
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {SessionService} from "../../services/session.service";
import {ResultService} from "../../services/result.service";
import {TreebankService} from "../../services/treebank.service";

interface TreebankSelection {
    treebank: string
    subTreebanks: string[]
}

interface GlobalState {
    currentStep: { number: number, step: Step };
    results: any[];
    selectedTreebanks: TreebankSelection;
    XPath: string;
    valid: boolean;
}

interface Step {
    stepNumber: number;
    // Makes sure the step is entered correctly
    enterStep(GlobalState): Observable<GlobalState>
}

class InputStep implements Step {
    stepNumber: number;
    constructor(stepNumber: number) {
        this.stepNumber = stepNumber;
    }

    enterStep(state: GlobalState) {
        state.currentStep = {
            number: this.stepNumber,
            step: this
        };
        return observableOf(state)
    }
}


class ResultStep implements Step {
    stepNumber: number;
    constructor(stepNumber: number, private resultService: ResultService) {
        this.stepNumber = stepNumber;
    }

    public enterStep(state: GlobalState): Observable<GlobalState> {
        return new Observable((observer) => {
            this.resultService.getResults(state.selectedTreebanks.treebank, state.selectedTreebanks.subTreebanks).subscribe((data) => {
                    state.currentStep = {
                        number: this.stepNumber,
                        step: this
                    };
                    state.results = data;
                    observer.next(state);
                    observer.complete()

                },
                e => console.log(e),
                () => {
                }
            );
        });


    }
}
class SelectTreebankStep implements Step {
    stepNumber: number;
    constructor(stepNumber, private treebankService: TreebankService, private http: HttpClient, private resultService: ResultService) {
        this.stepNumber = stepNumber;
    }

    enterStep(state: GlobalState): Observable<GlobalState> {
        return new Observable((observer) => {
            this.treebankService.preGetTreebanks(state.XPath).subscribe((res) => {
                state.currentStep = {
                    number: this.stepNumber,
                    step: this,
                }
                observer.next(state);
                observer.complete();

            });


        });
    }
}


export {
    TreebankSelection,
    GlobalState,
    Step,
    InputStep,
    SelectTreebankStep,
    ResultStep,
};
