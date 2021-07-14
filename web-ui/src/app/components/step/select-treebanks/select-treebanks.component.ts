import { Component, OnInit, OnDestroy } from '@angular/core';

import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { animations } from '../../../animations';
import { GlobalStateExampleBased, StepType } from '../../../pages/multi-step-page/steps';
import { Treebank, TreebankSelection } from '../../../treebank';
import { StateService, TreebankService, TreebankSelectionService } from '../../../services/_index';
import { StepDirective } from '../step.directive';
import { UserProvider } from './select-treebank-providers.component';

// bulma.io tag colors
const colors = [
    'black',
    'primary',
    'link',
    'info',
    'success',
    'warning',
    'danger'
];

function comparatorGenerator<T>(a: T, b: T, ...propertyExtractors: ((value: T) => any)[]): number {
    for (let extractor of propertyExtractors) {
        const extractedA = extractor(a);
        const extractedB = extractor(b);
        if (extractedA < extractedB) {
            return -1;
        } else if (extractedA > extractedB) {
            return 1;
        }
    }

    return 0;
}

@Component({
    animations,
    selector: 'grt-select-treebanks',
    templateUrl: './select-treebanks.component.html',
    styleUrls: ['./select-treebanks.component.scss']
})
export class SelectTreebanksComponent extends StepDirective<GlobalStateExampleBased> implements OnInit, OnDestroy {
    public treebanks: (Treebank & { color: string, userName: string, selected: boolean })[] = [];
    public loading = true;
    public stepType = StepType.SelectTreebanks;
    public selection: TreebankSelection;
    public userProviders: UserProvider[];
    public showUserTags = false;
    
    private readonly subscriptions: Subscription[];
    private userColors: { [userId: number]: string } = {};
    private userNames: { [userId: number]: string } = {};
    private colorIndex = 0;

    constructor(treebankService: TreebankService,
        private treebankSelectionService: TreebankSelectionService,
        stateService: StateService<GlobalStateExampleBased>) {
        super(stateService);

        this.subscriptions = [
            treebankService.treebanks.pipe(
                map(lookup => Object.values(lookup.data).flatMap(provider => Object.values(provider))))
                .subscribe(treebanks => {
                    this.treebanks = treebanks.map(treebank => ({
                        ...treebank,
                        ...{
                            color: this.determineUserColor(treebank.userId),
                            userName: this.determineUserName(treebank.email, treebank.userId)
                        },
                        selected: this.selection && this.selection.isSelected(treebank.provider, treebank.id)
                    })).sort((a, b) => comparatorGenerator(
                        a,
                        b,
                        value => value.displayName.toUpperCase(),
                        value => value.uploaded));

                    this.userProviders = (<[number, string][]><any[]>Object.entries(this.userNames)).map(
                        ([id, name]) => {
                            let color = this.userColors[id];
                            return {
                                id,
                                color,
                                name
                            }
                        }
                    ).sort((a, b) => comparatorGenerator(a, b, value => value.name.toUpperCase()));
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

    private determineUserColor(userId?: number): string {
        if (userId == undefined || userId == null) {
            return null;
        }

        let color = this.userColors[userId];
        if (color) {
            return color;
        }

        color = this.userColors[userId] = colors[this.colorIndex];
        this.colorIndex = (this.colorIndex + 1) % colors.length;

        return color;
    }

    private determineUserName(email?: string, userId?: number): string {
        if (userId == undefined || userId == null) {
            return null;
        }

        let userName = this.userNames[userId];
        if (userName) {
            return userName;
        }

        const parts = email.split('@')[0].split('.');
        userName = '';
        for (let part of parts) {
            if (part.length === 1) {
                userName += part.toUpperCase();
            } else {
                userName += ' ' + part[0].toUpperCase() + part.substr(1);
            }
        }

        userName = userName.trim();

        this.userNames[userId] = userName;

        return userName;
    }
}
