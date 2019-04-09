import { Component, OnDestroy } from '@angular/core';
import { StepComponent } from "../step.component";
import { TreebankService, ConfiguredTreebanks, mapToTreebankArray } from "../../../services/treebank.service";
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
    selector: 'grt-select-treebanks',
    templateUrl: './select-treebanks.component.html',
    styleUrls: ['./select-treebanks.component.scss']
})
export class SelectTreebanksComponent extends StepComponent implements OnDestroy {
    public treebanks: ConfiguredTreebanks[string][string][];
    private readonly subscriptions: Subscription[];

    constructor(private treebankService: TreebankService) {
        super();

        this.subscriptions = [
            treebankService.treebanks.pipe(map(v => Object.values(v.state).flatMap(v => Object.values(v))))
            .subscribe(treebanks => {
                this.treebanks = treebanks;
                this.updateValidity();
            }),
        ];
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    toggleTreebank(provider: string, corpus: string) {
        this.treebankService.toggleCorpus(provider, corpus);
    }

    /** Checks if there are treebanks selected and notifies parent */
    updateValidity() {
        if (!this.treebanks) {
            this.valid = false;
            return;
        }

        // treebank selected -> some component selected
        this.valid = this.treebanks.some(({treebank, componentGroups}) =>
            treebank.selected &&
            componentGroups.flatMap(g => Object.values(g.components)).some(component => component.selected)
        );

        this.changeValid.emit(this.valid);
    }

    public getValidationMessage() {
        return 'Please select a treebank and the components.';
    }
}
