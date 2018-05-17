import {AfterViewInit, Component, OnInit} from '@angular/core';
import {GlobalState} from "./steps";
import {Transitions} from "./transitions";
import {Crumb} from "../../components/breadcrumb-bar/breadcrumb-bar.component";

@Component({
    selector: 'grt-multi-step-page',
    templateUrl: './multi-step-page.component.html',
    styleUrls: ['./multi-step-page.component.scss']
})
export class MultiStepPageComponent implements AfterViewInit{


    globalState: GlobalState;
    configuration: any;
    transitions: Transitions;
    crumbs: Crumb[];
    components: any[];

    constructor() {
        // Template Design Pattern
        this.initializeCrumbs();
        this.initializeGlobalState();
        this.initializeConfiguration();
        this.initializeTransitions();
    }

    initializeCrumbs(){
        throw new Error('Not implemented');
    }

    initializeComponents(){
        throw new Error('Not implemented');
    }
    initializeGlobalState(){
        throw new Error('Not implemented');
    }

    initializeConfiguration(){
        throw new Error('Not implemented');
    }

    initializeTransitions(){
        throw new Error('Not implemented');
    }



    ngAfterViewInit(){
        this.initializeComponents();
    }

    /**
     * Go back one step
     */
    prev() {
        this.transitions.fire('decrease', this.globalState).subscribe((s) => {
            this.globalState = s;
        });

    }


    /**
     *  go to next step. Only can continue of the current step is valid.
     */
    next() {
        if (this.globalState.valid) {
            this.transitions.fire('increase', this.globalState).subscribe((s) => {
                this.globalState = s;
            });
        } else {
            this.showWarning();
        }
    }

    /**
     * Sets
     * @param boolean
     */
    setValid(valid: boolean) {
        this.globalState.valid = valid
    }

    /**
     * Show the warning of the appropriate component.
     */
    showWarning() {
        console.log(this.components);
        this.components[this.globalState.currentStep.number].showWarning();

    }


}
