import { Component, OnInit, OnDestroy } from '@angular/core';

import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { animations } from '../../../animations';
import { GlobalStateExampleBased, StepType } from '../../../pages/multi-step-page/steps';
import { Treebank, TreebankSelection } from '../../../treebank';
import { StateService, TreebankService, TreebankSelectionService } from '../../../services/_index';
import { StepDirective } from '../step.directive';
import _ from 'lodash';

@Component({
    animations,
    selector: 'grt-select-treebanks',
    templateUrl: './select-treebanks.component.html',
    styleUrls: ['./select-treebanks.component.scss']
})
export class SelectTreebanksComponent extends StepDirective<GlobalStateExampleBased> implements OnInit, OnDestroy {
    public treebanks: (Treebank & { selected: boolean })[] = [];
    public loading = true;
    public stepType = StepType.SelectTreebanks;
    public selection: TreebankSelection;

    private readonly subscriptions: Subscription[];

    constructor(treebankService: TreebankService,
        private treebankSelectionService: TreebankSelectionService,
        stateService: StateService<GlobalStateExampleBased>) {
        super(stateService);

        this.subscriptions = [
            treebankService.treebanks.pipe(
                map(lookup => Object.values(lookup.data).flatMap(provider => Object.values(provider))))
                .subscribe(treebanks => {
                    this.treebanks = _.orderBy(
                        treebanks.map(treebank => ({
                            ...treebank,
                            selected: this.selection && this.selection.isSelected(treebank.provider, treebank.id)
                        })),
                        ['displayName', 'uploaded']);
                }),
            treebankSelectionService.state$.subscribe(selection => {
                this.selection = selection;
                this.treebanks = this.treebanks.map(treebank => {
                    treebank.selected = selection.isSelected(treebank.provider, treebank.id);
                    return treebank;
                });
            })
        ];

        // this way treebanks are already shown once they have partially loaded
        treebankService.getTreebanks().then(() => this.loading = false);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    toggleTreebank(provider: string, corpus: string) {
        this.treebankSelectionService.toggleCorpus(provider, corpus);
    }

    public getWarningMessage() {
        return 'Please select a treebank and the components.';
    }
}
