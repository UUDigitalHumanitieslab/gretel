import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StateService, TreebankService, MWECanonicalService } from '../../services/_index';
import { MultiStepPageDirective } from '../multi-step-page/multi-step-page.directive';

import { GlobalState, SentenceInputStep, XpathInputStep, Step, ResultsStep } from '../multi-step-page/steps';
import { TreebankSelection } from '../../treebank';

interface MWEState extends GlobalState {
    canonicalForm: string,
}

@Component({
    selector: 'grt-multi-word-expressions',
    templateUrl: './multi-word-expressions.component.html',
    styleUrls: ['./multi-word-expressions.component.scss']
})
export class MultiWordExpressionsComponent extends MultiStepPageDirective<MWEState> {
    protected defaultGlobalState: MWEState = {
        connectionError: false,
        currentStep: undefined,
        filterValues: {},
        loading: false,
        retrieveContext: false,
        selectedTreebanks: new TreebankSelection(this.treebankService),
        valid: true,
        variableProperties: undefined,
        xpath: '',
        canonicalForm: '',
    };

    private mweService: MWECanonicalService;
    steps: Step<MWEState>[];

    constructor(treebankService: TreebankService, stateService: StateService<MWEState>,
                mweService: MWECanonicalService,
                route: ActivatedRoute, router: Router) {
        super(route, router, treebankService, stateService);
        this.mweService = mweService;
    }

    initializeSteps(): { step: Step<MWEState>, name: string }[] {
        return [{
            step: new SentenceInputStep(0),
            name: 'Canonical form'
        },
        {
            name: 'Query',
            step: new XpathInputStep(1),
        },
        {
            step: new ResultsStep(2),
            name: 'Results',
        }];
    }

    decodeGlobalState(queryParams: { [key: string]: any }) {
        return {
            selectedTreebanks: new TreebankSelection(
                this.treebankService,
                queryParams.selectedTreebanks ? JSON.parse(queryParams.selectedTreebanks) : undefined),
            xpath: queryParams.xpath || this.defaultGlobalState.xpath
        };
    }

    loadSentences() : string[] {
        return this.mweService.get();
    }

    async startWithExpression(expression: string) {
        console.log('chosen expression:', expression);
        this.setValid(true);
        this.next();
    }
}
