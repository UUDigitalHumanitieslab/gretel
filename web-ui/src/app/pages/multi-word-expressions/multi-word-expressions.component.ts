import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StateService, TreebankService, MWECanonicalService, MWEQueryMakerService } from '../../services/_index';
import { MultiStepPageDirective } from '../multi-step-page/multi-step-page.directive';

import {
    GlobalState, SentenceInputStep, XpathInputStep, Step, SelectTreebankStep,
    ResultsStep
} from '../multi-step-page/steps';
import { TreebankSelection } from '../../treebank';

import { MWEQuerySet } from '../../services/mwe-query-maker.service';

interface MWEState extends GlobalState {
    canonicalForm: string,
    querySet: MWEQuerySet
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
        querySet: undefined
    };

    private mweService: MWECanonicalService;
    private mweQueryService: MWEQueryMakerService;
    steps: Step<MWEState>[];
    sentences: Promise<string[]>;

    constructor(treebankService: TreebankService, stateService: StateService<MWEState>,
                mweService: MWECanonicalService, mweQueryService: MWEQueryMakerService,
                route: ActivatedRoute, router: Router) {
        super(route, router, treebankService, stateService);
        this.mweService = mweService;
        this.mweQueryService = mweQueryService;

        this.sentences = this.mweService.get();
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
            name: 'Treebanks',
            step: new SelectTreebankStep(2, this.treebankService)
        },
        {
            step: new ResultsStep(3),
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

    async startWithExpression(canonicalForm: string) {
        console.log('chosen expression:', canonicalForm);
        this.setValid(true);

        let querySet = await this.mweQueryService.translate(canonicalForm);
        this.stateService.setState({canonicalForm, querySet});
        this.next();
    }

    proceedWithQuery(xpath: string) {
        console.log('chosen query:', xpath);
        this.stateService.setState({xpath});
        this.setValid(true);
        this.next();
    }
}
