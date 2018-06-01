import { AfterViewChecked, AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { Crumb } from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import { GlobalState, Step } from "./steps";
import { DecreaseTransition, IncreaseTransition, JumpToStepTransition, Transition, Transitions } from "./transitions";

export abstract class MultiStepPageComponent<T extends GlobalState> implements OnInit, AfterViewChecked {
    public crumbs: Crumb[];
    public globalState: T;

    protected configuration: { steps: Step<T>[] };
    protected components: any[];
    protected steps: Step<T>[];

    private transitions: Transitions<T>;

    constructor(private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit() {
        // Template Design Pattern
        this.initializeCrumbs();
        this.initializeSteps();
        this.initializeConfiguration();
        this.initializeGlobalState();

        this.initializeTransitions();
        this.globalState.currentStep.enterStep(this.globalState).subscribe(state => {
            this.globalState = state;
        });
    }

    abstract initializeConfiguration();
    abstract initializeCrumbs();
    abstract initializeSteps();
    abstract initializeComponents();

    abstract queryParamsToGlobalState(queryParams: any): T;
    abstract stateToJson(state: T): {};

    getGlobalStateFromUrl(): T {
        let queryParams = this.getQueryParams();
        return this.queryParamsToGlobalState(queryParams);
    }

    initializeGlobalState() {
        this.globalState = this.getGlobalStateFromUrl();
    }

    initializeTransitions() {
        let transitions: Transition<T>[] = [new IncreaseTransition(this.configuration.steps), new DecreaseTransition(this.configuration.steps)];
        for (const crumb of this.crumbs) {
            transitions.push(new JumpToStepTransition(this.steps[crumb.number]))
        }

        this.transitions = new Transitions(transitions);
    }

    ngAfterViewChecked() {
        this.initializeComponents();
    }

    /**
     * Go back one step
     */
    prev() {
        this.transitions.fire('decrease', this.globalState).subscribe((s) => {
            this.updateGlobalState(s)
        });
    }

    updateGlobalState(state: T) {
        this.globalState = state;
        this.writeStateToUrl();
    }

    /**
     *  go to next step. Only can continue of the current step is valid.
     */
    next() {
        if (this.globalState.valid) {
            this.transitions.fire('increase', this.globalState).subscribe((s) => {
                this.updateGlobalState(s)
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
        this.components[this.globalState.currentStep.number].showWarning();
    }

    getQueryParams() {
        // To make sure there is no compile time error
        let temp: any = this.route;
        return temp.queryParams._value
    }


    getStepFromNumber(n: number) {
        if (n) {
            return this.steps[n]
        } else {
            return this.steps[0]
        }
    }

    writeStateToUrl() {
        let state = this.stateToJson(this.globalState);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: state,
            skipLocationChange: false
        })
    }

    goToStep(stepNumber: number) {
        this.transitions.fire(`jumpTo_${stepNumber}`, this.globalState).subscribe(state => this.globalState = state);
    }

    updateSelectedMainTreebank(mainTreebank: string) {
        this.globalState.selectedTreebanks.corpus = mainTreebank;
        this.writeStateToUrl();
    }

    updateSelectedSubTreebanks(subTreebanks: string[]) {
        this.globalState.selectedTreebanks.components = subTreebanks;
        this.writeStateToUrl();
    }
}
