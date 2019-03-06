import { AfterViewChecked, AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { Subscription } from 'rxjs';

import { Crumb } from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import { GlobalState, Step } from "./steps";
import { DecreaseTransition, IncreaseTransition, JumpToStepTransition, Transition, Transitions } from "./transitions";
import { mapTreebanksToSelectionSettings, FilterValues } from '../../services/_index';

export abstract class MultiStepPageComponent<T extends GlobalState> implements OnDestroy, OnInit, AfterViewChecked {
    public crumbs: Crumb[];
    public globalState: T;
    public warning: string | false;
    /**
     * Whether the next step is currently being resolved
     */
    public isTransitioning = false;

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
                const decoded = this.decodeGlobalState(params);
                Object.assign(this.globalState, _.pickBy(decoded.state, (item) => item !== undefined));
                // if we don't set this, we might try to serialize the globalstate before the step has been entered (it happens asyncronously), causing an undefined access.
                this.globalState.currentStep = this.steps[decoded.step];
                this.goToStep(decoded.step, false);
            }));
    }

    abstract initializeConfiguration(): void;
    abstract initializeCrumbs(): void;
    abstract initializeSteps(): void;
    abstract initializeComponents(): void;

    /**
     * Returns the properties of the global state which are set in the URL.
     * @param queryParams
     */
    abstract decodeGlobalState(queryParams: { [key: string]: any }): {
        step: number, state: { [K in keyof GlobalState]?: GlobalState[K] | undefined }
    };

    encodeGlobalState(state: T): { [key: string]: any } {
        return {
            'currentStep': state.currentStep.number,
            // don't encode the default state
            'xpath': state.xpath != this.defaultGlobalState.xpath ? state.xpath : undefined,
            'selectedTreebanks': state.selectedTreebanks.length > 0 ? JSON.stringify(state.selectedTreebanks) : undefined,
            'retrieveContext': this.encodeBool(state.retrieveContext)
        };
    }

    initializeGlobalState() {
        this.globalState = Object.assign({}, this.defaultGlobalState);
    }

    initializeTransitions() {
        const transitions: Transition<T>[] = [
            new IncreaseTransition(this.configuration.steps),
            new DecreaseTransition(this.configuration.steps)];
        for (const crumb of this.crumbs) {
            transitions.push(new JumpToStepTransition(this.steps, crumb.number));
        }

        this.transitions = new Transitions(transitions);
    }

    ngAfterViewChecked() {
        this.initializeComponents();
    }

    /**
     * Go back one step
     */
    async prev() {
        this.isTransitioning = true;
        const state = await this.transitions.fire('decrease', this.globalState);
        this.updateGlobalState(state);
    }

    updateGlobalState(state: T, updateUrl = true) {
        this.isTransitioning = false;
        this.globalState = state;
        if (updateUrl) {
            this.updateUrl();
        }
    }

    /**
     * Goes to the next step if the state is valid. Otherwise a warning will displayed.
     */
    async next() {
        if (this.globalState.valid) {
            this.isTransitioning = true;
            const state = await this.transitions.fire('increase', this.globalState);
            this.updateGlobalState(state);
            this.warning = false;
        } else {
            this.showWarning(this.globalState);
        }
    }

    setValid(valid: boolean) {
        this.globalState.valid = valid;
    }

    /**
     * Show the warning of the appropriate component.
     */
    showWarning(state: T) {
        const component = this.components[state.currentStep.number];
        if (component && component.getValidationMessage) {
            this.warning = component.getValidationMessage();
        } else {
            this.warning = 'Please check your input and retry.';
        }
    }

    getStepFromNumber(n: number) {
        if (n) {
            return this.steps[n];
        } else {
            return this.steps[0];
        }
    }

    updateUrl(writeState = true) {
        const state = this.encodeGlobalState(this.globalState);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: state,
            skipLocationChange: false,
            replaceUrl: writeState ? false : true
        });
    }

    async goToStep(stepNumber: number, updateUrl = true) {
        this.isTransitioning = true;
        const state = await this.transitions.fire(`jumpTo_${stepNumber}`, this.globalState);
        if (!state.valid && state.currentStep.number !== stepNumber) {
            this.showWarning(state);
        } else {
            this.warning = false;
        }

        this.updateGlobalState(state, state.currentStep.number === stepNumber && updateUrl);
    }

    updateFilterValues(filterValues: FilterValues) {
        this.globalState.filterValues = filterValues;
    }

    filterResults(values: { xpath: string, filterValues: FilterValues }, resultsStep) {
        // TODO: xpath
        this.globalState.filterValues = values.filterValues;
        this.goToStep(resultsStep, true);
    }

    protected decodeBool(param: string | undefined): boolean | undefined {
        if (param === '1') {
            return true;
        } else if (param === '0') {
            return false;
        }
        return undefined;
    }

    protected encodeBool(bool: boolean) {
        return bool ? '1' : '0';
    }
}
