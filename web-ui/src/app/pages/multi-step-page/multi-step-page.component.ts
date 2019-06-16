import { OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import * as _ from 'lodash';

import { Subscription } from 'rxjs';

import { Crumb } from '../../components/breadcrumb-bar/breadcrumb-bar.component';
import { GlobalState, Step } from './steps';
import { FilterValues, TreebankService, StateService, mapTreebanksToSelectionSettings } from '../../services/_index';
import { filter, map } from 'rxjs/operators';

export abstract class MultiStepPageComponent<T extends GlobalState> implements OnDestroy, OnInit {
    public crumbs: Crumb[];
    public globalState: T;
    public warning: string | false;
    /**
     * Whether the next step is currently being resolved
     */
    public isTransitioning = false;

    protected abstract defaultGlobalState: T;

    protected steps: Step<T>[];
    protected subscriptions: Subscription[];


    constructor(
        private route: ActivatedRoute,
        private router: Router,
        public treebankService: TreebankService,
        public stateService: StateService<T>) {
    }

    ngOnDestroy() {
        // prevent navigation from deferred events
        this.router = undefined;
        this.subscriptions.forEach(s => s.unsubscribe());
        this.stateService.dispose();
    }

    async ngOnInit() {
        // Template Design Pattern
        const steps = this.initializeSteps();

        this.crumbs = steps.map((step, number) => ({
            name: step.name,
            number
        }));
        this.steps = steps.map(step => step.step);

        const initialState = await this.initializeGlobalState();

        this.stateService.init(this.steps);
        this.subscriptions = [
            this.stateService.isTransitioning$.subscribe(t => this.isTransitioning = t),
            this.stateService.warning$.subscribe(w => this.warning = w)
        ];

        this.subscriptions.push(
            this.route.queryParams.subscribe(params => {
                const decoded = this.decodeGlobalState(params);
                if (!this.globalState) {
                    this.globalState = initialState;
                }

                Object.assign(this.globalState, _.pickBy(decoded.state, (item) => item !== undefined));

                if (this.globalState.selectedTreebanks.length) {
                    // This also needs to be pushed in to the service to force an update on
                    // all components (important to restore state from url on first page render)
                    this.treebankService.initSelections(this.globalState.selectedTreebanks);
                }

                this.goToStep(decoded.step, false);
            }));

        this.subscriptions.push(
            this.treebankService.treebanks.pipe(
                map(v => mapTreebanksToSelectionSettings(v.state))
            ).subscribe(state => this.updateSelected(state))
        );
    }

    abstract initializeSteps(): { step: Step<T>, name: string }[];

    /**
     * Returns the properties of the global state which are set in the URL.
     * @param queryParams
     */
    abstract decodeGlobalState(queryParams: { [key: string]: any }): {
        step: number, state: { [K in keyof GlobalState]?: GlobalState[K] | undefined }
    };

    encodeGlobalState(state: T): { [key: string]: any } {
        return {
            'currentStep': state.currentStep && state.currentStep.number || 0,
            // don't encode the default state
            'xpath': state.xpath !== this.defaultGlobalState.xpath ? state.xpath : undefined,
            'selectedTreebanks': state.selectedTreebanks.length > 0 ? JSON.stringify(state.selectedTreebanks) : undefined,
            'retrieveContext': this.encodeBool(state.retrieveContext)
        };
    }

    private async initializeGlobalState() {
        // Always start at the first step, if it is restored from the query
        // this is done using a jump to make sure all the variables are
        // retrieved again during the state transitions.
        return await this.steps[0].enterStep(Object.assign({}, this.defaultGlobalState));
    }

    /**
     * Go back one step
     */
    async prev() {
        const state = await this.stateService.prev(this.globalState);
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
     * Updates the selected treebanks with the given selection
     * @param selectedTreebanks the new treebank selection
     */
    abstract updateSelected(selectedTreebanks: ReturnType<typeof mapTreebanksToSelectionSettings>): void;

    /**
     * Goes to the next step if the state is valid. Otherwise a warning will displayed.
     */
    async next() {
        const state = await this.stateService.next(this.globalState);
        if (state) {
            this.updateGlobalState(state);
        }
    }

    setValid(valid: boolean) {
        this.globalState.valid = valid;
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
        const state = await this.stateService.jump(this.globalState, stepNumber);
        this.updateGlobalState(state, state.currentStep.number === stepNumber && updateUrl);
    }

    updateFilterValues(filterValues: FilterValues) {
        this.globalState.filterValues = filterValues;
    }

    filterResults(values: { xpath: string, filterValues: FilterValues }, resultsStep: number) {
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
