import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StateService, TreebankService, MweCanonicalService, MweQueryMakerService } from '../../services/_index';
import { MweCanonicalForm } from '../../services/mwe-canonical.service';
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

class MweQueriesStep extends XpathInputStep<MweState> {
    constructor(number: number, private mweQueryService: MweQueryMakerService) {
        super(number);
    }

    async enterStep(state: MweState) {
        state.currentStep = this;
        state.valid = false;

        state.querySet = await this.mweQueryService.translate(state.canonicalForm);
        state.valid = true;
        return state;
    }
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
    canonicalForms: Promise<MweCanonicalForm[]>;

    constructor(treebankService: TreebankService, stateService: StateService<MweState>,
                mweService: MweCanonicalService, mweQueryService: MweQueryMakerService,
                route: ActivatedRoute, router: Router) {
        super(route, router, treebankService, stateService);
        this.mweService = mweService;
        this.mweQueryService = mweQueryService;

        this.canonicalForms = this.mweService.get();
    }

    initializeSteps(): { step: Step<MweState>, name: string }[] {
        return [{
            step: new SentenceInputStep(0),
            name: 'Canonical form'
        },
        {
            name: 'Query',
            step: new MweQueriesStep(1, this.mweQueryService),
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

    encodeGlobalState(state: MweState) {
        return Object.assign(super.encodeGlobalState(state), {
            'canonicalForm': state.canonicalForm,
            'xpath': state.xpath
        });
    }

    decodeGlobalState(queryParams: { [key: string]: any }) {
        return {
            selectedTreebanks: new TreebankSelection(
                this.treebankService,
                queryParams.selectedTreebanks ? JSON.parse(queryParams.selectedTreebanks) : undefined),
            xpath: queryParams.xpath || this.defaultGlobalState.xpath,
            canonicalForm: queryParams.canonicalForm,
            valid: true
        };
    }

    async startWithExpression(canonicalForm: string) {
        this.stateService.setState({canonicalForm});
        this.setValid(true);
        this.next();
    }

    proceedWithQuery(xpath: string) {
        this.stateService.setState({xpath});
        this.setValid(true);
        this.next();
    }

    updateXPath(xpath: string) {
        console.log(xpath);
    }
}
