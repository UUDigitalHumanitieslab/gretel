import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StateService, TreebankService, MweCanonicalService, MweQueryMakerService } from '../../services/_index';
import { MultiStepPageDirective } from '../multi-step-page/multi-step-page.directive';

import {
    GlobalState, SentenceInputStep, XpathInputStep, Step, SelectTreebankStep,
    ResultsStep
} from '../multi-step-page/steps';
import { TreebankSelection } from '../../treebank';

import { MweQuerySet } from '../../services/mwe-query-maker.service';

interface MweState extends GlobalState {
    canonicalForm: string,
    querySet: MweQuerySet
}

@Component({
    selector: 'grt-multi-word-expressions',
    templateUrl: './multi-word-expressions.component.html',
    styleUrls: ['./multi-word-expressions.component.scss']
})
export class MultiWordExpressionsComponent extends MultiStepPageDirective<MweState> implements OnInit {
    protected defaultGlobalState: MweState = {
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

    private mweService: MweCanonicalService;
    private mweQueryService: MweQueryMakerService;
    steps: Step<MweState>[];
    sentences: Promise<string[]>;

    constructor(treebankService: TreebankService, stateService: StateService<MweState>,
                mweService: MweCanonicalService, mweQueryService: MweQueryMakerService,
                route: ActivatedRoute, router: Router) {
        super(route, router, treebankService, stateService);
        this.mweService = mweService;
        this.mweQueryService = mweQueryService;

        this.sentences = this.mweService.get();
    }

    initializeSteps(): { step: Step<MweState>, name: string }[] {
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
