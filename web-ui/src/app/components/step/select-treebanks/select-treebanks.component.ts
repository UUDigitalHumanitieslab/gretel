import { Component, EventEmitter, Input, OnChanges, OnInit, Output, OnDestroy } from '@angular/core';
import { StepComponent } from "../step.component";
import { ConfigurationService } from "../../../services/configuration.service";
import { TreebankService, ConfiguredTreebanks, mapToTreebankArray } from "../../../services/treebank.service";
import { Treebank, TreebankComponent } from "../../../treebank";
// import { SelectedTreebanksService, SelectedTreebanks } from '../../../services/selected-treebanks.service';
import { filter, map } from 'rxjs/operators';
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

    // ngOnInit() {
    //     // this.treebankService.getConfiguredTreebankArray()
    //     // .then(treebanks => {
    //     //     this.treebanks = treebanks;
    //     //     this.updateValidity();
    //     // })

    //     // this.configurationService.getProviders()
    //     // .then(providers => Promise.all(providers.map(p => this.treebankService.getTreebanks(p))))
    //     // .then(treebanks => {
    //     //     this.treebanks = treebanks.flat();
    //     //     this.updateValidity();
    //     // })
    // }

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

        this.onChangeValid.emit(this.valid);
    }

    getValidationMessage() {
        return 'Please select a treebank and the components.';
    }
}
