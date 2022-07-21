import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StateService, TreebankService, MweService,
         EmitType} from '../../services/_index';
import { MweCanonicalForm } from '../../services/mwe.service';
import { MultiStepPageDirective } from '../multi-step-page/multi-step-page.directive';

import {
    GlobalState, SentenceInputStep, XpathInputStep, Step, SelectTreebankStep,
    ResultsStep, AnalysisStep
} from '../multi-step-page/steps';
import { TreebankSelection } from '../../treebank';

import { MweQuerySet } from '../../services/mwe.service';

interface MweState extends GlobalState {
    canonicalForm: string,
    querySet: MweQuerySet
}

class MweQueriesStep extends XpathInputStep<MweState> {
    constructor(number: number, private mweService: MweService) {
        super(number);
    }

    async enterStep(state: MweState) {
        state.currentStep = this;
        state.valid = false;

        state.querySet = await this.mweService.generateQuery(state.canonicalForm);
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

    private mweService: MweService;
    steps: Step<MweState>[];
    canonicalForms: Promise<MweCanonicalForm[]>;

    constructor(treebankService: TreebankService, stateService: StateService<MweState>,
                mweService: MweService, route: ActivatedRoute, router: Router) {
        super(route, router, treebankService, stateService);
        this.mweService = mweService;

        this.canonicalForms = this.mweService.getCanonical();
    }

    initializeSteps(): { step: Step<MweState>, name: string }[] {
        return [{
            step: new SentenceInputStep(0),
            name: 'Canonical form'
        },
        {
            name: 'Query',
            step: new MweQueriesStep(1, this.mweService),
        },
        {
            name: 'Treebanks',
            step: new SelectTreebankStep(2, this.treebankService)
        },
        {
            step: new ResultsStep(3),
            name: 'Results',
        },
        {
            step: new AnalysisStep(4),
            name: 'Analysis',
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

    async updateXPath(xpath: string, emit: EmitType) {
        this.stateService.setState({
            xpath
        },
            emit);
    }
}
