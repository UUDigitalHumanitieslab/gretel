import { Injectable } from '@angular/core';
import { GlobalState, Step } from '../pages/multi-step-page/steps';
import { StepComponent } from '../components/step/step.component';
import { BehaviorSubject, Observable } from 'rxjs';

class ExternalPromise<T> {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason: any) => void;

    promise = new Promise<T>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
    });
}

/**
 * A transition is used to determine the next step to go to, given the global state and the event that is triggered
 */
class SharedInstance<T extends GlobalState> {
    private steps: Step<T>[];
    private currentStepComponent = new ExternalPromise<StepComponent<T>>();
    isTransitioning$ = new BehaviorSubject<boolean>(false);
    warning$ = new BehaviorSubject<string | false>(false);

    constructor(steps: Step<T>[]) {
        this.steps = steps;
        this.isTransitioning$.next(false);
    }

    subscribe(stepComponent: StepComponent<T>) {
        this.currentStepComponent.resolve(stepComponent);
    }

    dispose() {
        this.isTransitioning$.unsubscribe();
        this.warning$.unsubscribe();
    }

    /**
     * Go back one step
     */
    async prev(state: T): Promise<T> {
        state.connectionError = false;
        this.isTransitioning$.next(true);
        this.warning$.next(false);
        this.currentStepComponent = new ExternalPromise();
        return this.jumpState(state, state.currentStep.number - 1);
    }

    /**
     * Goes to the next step if the state is valid. Otherwise a warning will displayed.
     */
    async next(state: T): Promise<T | false> {
        if (state.valid) {
            state.connectionError = false;
            this.isTransitioning$.next(true);
            this.warning$.next(false);
            this.currentStepComponent = new ExternalPromise();
            state = await this.jumpState(state, state.currentStep.number + 1);
            if (state.connectionError) {
                // the initial state may be invalid (e.g. nothing has been selected yet)
                // but if the state is invalid because of a connection error
                // this should be shown to the user!
                this.showWarning(state.currentStep.number);
            }

            return state;
        } else {
            this.showWarning(state.currentStep.number);
            return false;
        }
    }

    async jump(state: T, stepNumber: number) {
        this.isTransitioning$.next(true);
        this.currentStepComponent = new ExternalPromise();
        state = await this.jumpState(state, stepNumber);

        if (state.connectionError || (!state.valid && state.currentStep.number !== stepNumber)) {
            this.showWarning(state.currentStep.number);
        } else {
            this.warning$.next(false);
        }

        return state;
    }

    /**
     * Transition the state and creates the new state.
     * @param state: the current state.
     * @param stepNumber: the index of the step to jump to.
     */
    private async jumpState(state: T, stepNumber: number) {
        if (!state.currentStep) {
            // no step yet, start at the first one
            state = await this.steps[0].enterStep(state);
        }

        if (state.currentStep.number === stepNumber ||
            stepNumber < 0 ||
            stepNumber > this.steps.length - 1) {
            // no or invalid jump
            return state;
        }

        // don't modify the original state
        // (otherwise the interface might display the intermediate state)
        state = Object.assign({}, state);

        if (state.currentStep.number > stepNumber) {
            // jumping backwards is always fine
            state.currentStep.leaveStep(state);
            state.connectionError = false;
            return this.steps[stepNumber].enterStep(state);
        }

        while (state.currentStep.number < stepNumber && state.valid) {
            state.currentStep.leaveStep(state);
            state.connectionError = false;
            state = await this.steps[state.currentStep.number + 1].enterStep(state);
        }

        return state;
    }

    private async showWarning(stepNumber: number) {
        const targetStep = this.steps[stepNumber];
        const currentStep = await this.currentStepComponent.promise;
        if (currentStep.stepType === targetStep.type) {
            this.warning$.next(currentStep.getWarningMessage() || false);
        }
    }
}

/**
 * For jumps
 */
@Injectable({ providedIn: 'root' })
export class StateService<T extends GlobalState> {
    /**
     * Use a shared instance for the duration of going through the steps
     * (example based or xpath based search). When going to another
     * multi-step page it should be cleared to make sure no deferred
     * actions popup on that page. E.g. a warning message or jump
     * could be fired after a server call is completed.
     */
    private static instance: SharedInstance<any>;
    private get instance() { return StateService.instance; }
    private set instance(value) { StateService.instance = value; }

    isTransitioning$: Observable<boolean>;
    warning$: Observable<string | false>;

    /**
     * This is called on entry of the multi-step page
     * @param steps The steps of this page.
     */
    init(steps: Step<T>[]) {
        this.dispose();
        this.instance = new SharedInstance<T>(steps);
        this.isTransitioning$ = this.instance.isTransitioning$.asObservable();
        this.warning$ = this.instance.warning$.asObservable();
    }

    /**
     * Subscribes a step component once it has been rendered and is ready to
     * receive information e.g. warning messages.
     * @param component The component showing the step state.
     */
    subscribe(component: StepComponent<T>) {
        this.instance.subscribe(component);
    }

    /**
     * Transition that decreases the current step number (if possible)
     */
    prev(state: T): Promise<T> {
        return this.instance.prev(state);
    }

    /**
     * Transition that increases the current step number (if possible)
     */
    next(state: T): Promise<T> {
        return this.instance.next(state);
    }

    jump(state: T, stepNumber: number): Promise<T> {
        return this.instance.jump(state, stepNumber);
    }

    /**
     * Disposes the shared instance when leaving the multi-step page.
     */
    dispose() {
        if (this.instance) {
            this.instance.dispose();
            this.instance = undefined;
        }
    }
}
