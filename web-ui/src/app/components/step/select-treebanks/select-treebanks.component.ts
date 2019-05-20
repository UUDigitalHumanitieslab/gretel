import { Component, OnDestroy } from '@angular/core';
import { StepComponent } from '../step.component';
import { TreebankService, TreebankInfo } from '../../../services/treebank.service';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { StateService } from '../../../services/_index';
import { GlobalStateExampleBased, StepType } from '../../../pages/multi-step-page/steps';

@Component({
    selector: 'grt-select-treebanks',
    templateUrl: './select-treebanks.component.html',
    styleUrls: ['./select-treebanks.component.scss']
})
export class SelectTreebanksComponent extends StepComponent<GlobalStateExampleBased> implements OnDestroy {
    public treebanks: TreebankInfo[] = [];
    public loading = true;
    public stepType = StepType.SelectTreebanks;

    private readonly subscriptions: Subscription[];

    constructor(private treebankService: TreebankService, stateService: StateService<GlobalStateExampleBased>) {
        super(stateService);

        this.subscriptions = [
            treebankService.treebanks.pipe(map(v => Object.values(v.state).flatMap(v => Object.values(v))))
                .subscribe(treebanks => {
                    this.treebanks = treebanks;
                    this.updateValidity();
                }),
        ];
        treebankService.finishedLoading.then(() => this.loading = false);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    toggleTreebank(provider: string, corpus: string) {
        this.treebankService.toggleCorpus(provider, corpus);
    }

    /**
     * Checks if there are treebanks selected and notifies parent
     */
    private updateValidity() {
        // treebank selected -> some component selected
        this.valid = this.treebanks.some(
            ({ treebank, components }) => treebank.selected && Object.values(components).some(c => c.selected));
        this.changeValid.emit(this.valid);
    }

    public getWarningMessage() {
        return 'Please select a treebank and the components.';
    }
}
