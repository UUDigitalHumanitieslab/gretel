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

import { MweQuery, MweQuerySet } from '../../services/mwe.service';

interface MweState extends GlobalState {
    canonicalForm: {text: string, id?:number};
    querySet: MweQuerySet;
    currentQuery: MweQuery;
}

class MweQueriesStep extends XpathInputStep<MweState> {
    constructor(number: number, private mweService: MweService) {
        super(number);
    }

    async enterStep(state: MweState) {
        state.currentStep = this;
        state.valid = false;

        state.querySet = await this.mweService.generateQuery(state.canonicalForm.text);
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
        canonicalForm: null,
        querySet: undefined,
        currentQuery: null,
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
            'canonicalForm': JSON.stringify(state.canonicalForm),
            'currentQuery': JSON.stringify(state.currentQuery),
            'xpath': state.xpath
        });
    }

    decodeGlobalState(queryParams: { [key: string]: any }) {
        return {
            selectedTreebanks: new TreebankSelection(
                this.treebankService,
                queryParams.selectedTreebanks ? JSON.parse(queryParams.selectedTreebanks) : undefined),
            xpath: queryParams.xpath || this.defaultGlobalState.xpath,
            canonicalForm: JSON.parse(queryParams.canonicalForm ?? '{}'),
            currentQuery: JSON.parse(queryParams.currentQuery ?? '{}'),
            valid: true
        };
    }

    async startWithExpression(canonicalForm: {text: string, id: number}) {
        this.stateService.setState({canonicalForm});
        this.setValid(true);
        this.next();
    }

    proceedWithQuery(query: MweQuery) {
        this.stateService.setState({xpath: query.xpath, currentQuery: query});
        this.setValid(true);
        this.next();
    }

    async updateXPath(xpath: string, emit: EmitType) {
        this.stateService.setState({
            xpath
        },
            emit);
    }

    changeQuery(query: MweQuery) {
        this.globalState.currentQuery = query;
        this.updateXPath(query.xpath, false);
    }

    async saveQuery() {
        let query = this.globalState.currentQuery;
        let response = await this.mweService.saveCustomQuery({
            id: query.id,
            description: query.description,
            xpath: this.globalState.xpath,
            rank: query.rank,
            canonical: this.globalState.canonicalForm.id,
        });

        this.stateService.setState({currentQuery: response});
    }
}
