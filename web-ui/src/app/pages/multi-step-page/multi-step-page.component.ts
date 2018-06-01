import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

import * as _ from 'lodash';

import { Subscription } from 'rxjs/Subscription';

import { Crumb } from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import { GlobalState, Step } from "./steps";
import { DecreaseTransition, IncreaseTransition, JumpToStepTransition, Transition, Transitions } from "./transitions";

export abstract class MultiStepPageComponent<T extends GlobalState> implements OnDestroy, OnInit, AfterViewChecked {
    public crumbs: Crumb[];
    public globalState: T;

    protected abstract defaultGlobalState: T;

    protected configuration: { steps: Step<T>[] };
    protected components: any[];
    protected steps: Step<T>[];
    protected subscriptions: Subscription[] = [];

    private transitions: Transitions<T>;

    constructor(private route: ActivatedRoute, private router: Router) {
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    ngOnInit() {
        // Template Design Pattern
        this.initializeCrumbs();
        this.initializeSteps();
        this.initializeConfiguration();
        this.initializeGlobalState();
        this.initializeTransitions();

        this.subscriptions.push(
            this.route.queryParams.subscribe(params => {
                let decoded = this.decodeGlobalState(params);
                Object.assign(this.globalState, _.pickBy(decoded.state, (item) => item !== undefined));
                this.globalState.currentStep = this.steps[decoded.step];
                this.goToStep(decoded.step);
            }));
    }

    abstract initializeConfiguration();
    abstract initializeCrumbs();
    abstract initializeSteps();
    abstract initializeComponents();

    /**
     * Returns the properties of the global state which are set in the URL.
     * @param queryParams
     */
    abstract decodeGlobalState(queryParams: { [key: string]: any }): { step: number, state: { [K in keyof GlobalState]?: GlobalState[K] | undefined } };
    encodeGlobalState(state: T): { [key: string]: any } {
        return {
            'currentStep': state.currentStep.number,
            // don't encode the default state
            'xpath': state.xpath != this.defaultGlobalState.xpath ? state.xpath : undefined,
            'selectedTreebanks': state.selectedTreebanks && state.selectedTreebanks.corpus ? JSON.stringify(state.selectedTreebanks) : undefined,
            'retrieveContext': this.encodeBool(state.retrieveContext)
        }
    }

    initializeGlobalState() {
        this.globalState = Object.assign({}, this.defaultGlobalState);
    }

    initializeTransitions() {
        let transitions: Transition<T>[] = [new IncreaseTransition(this.configuration.steps), new DecreaseTransition(this.configuration.steps)];
        for (const crumb of this.crumbs) {
            transitions.push(new JumpToStepTransition(this.steps[crumb.number]));
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
        this.updateUrl();
    }

    /**
     * Goes to the next step if the state is valid. Otherwise a warning will displayed.
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

    getStepFromNumber(n: number) {
        if (n) {
            return this.steps[n]
        } else {
            return this.steps[0]
        }
    }

    updateUrl(writeState = true) {
        let state = this.encodeGlobalState(this.globalState);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: state,
            skipLocationChange: false,
            replaceUrl: writeState ? false : true
        })
    }

    goToStep(stepNumber: number) {
        this.transitions.fire(`jumpTo_${stepNumber}`, this.globalState).subscribe(state => this.globalState = state);
    }

    updateSelectedMainTreebank(mainTreebank: string) {
        this.globalState.selectedTreebanks.corpus = mainTreebank;
        this.updateUrl(false);
    }

    updateSelectedSubTreebanks(subTreebanks: string[]) {
        this.globalState.selectedTreebanks.components = subTreebanks;
        this.updateUrl(false);
    }

    protected decodeBool(param: string | undefined): boolean | undefined {
        if (param == '1') {
            return true;
        } else if (param == '0') {
            return false;
        }
        return undefined;
    }

    protected encodeBool(bool: boolean) {
        return bool ? '1' : '0';
    }
}
