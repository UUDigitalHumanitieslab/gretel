import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StateService, TreebankService, MweService } from '../../services/_index';
import { MweCanonicalForm } from '../../services/mwe.service';
import { MultiStepPageDirective } from '../multi-step-page/multi-step-page.directive';

import {
    GlobalState, SentenceInputStep, Step, SelectTreebankStep,
    ResultsStep, AnalysisStep
} from '../multi-step-page/steps';
import { TreebankSelection } from '../../treebank';

import { MweQuery, MweQuerySet } from '../../services/mwe.service';

interface MweState extends GlobalState {
    canonicalForm: {text: string, id?:number};
    querySet: MweQuerySet;
    currentQuery: MweQuery;
}

class MweResultsStep extends ResultsStep<MweState> {
    constructor(number: number, private mweService: MweService) {
        super(number);
    }

    async enterStep(state: MweState) {
        state.currentStep = this;
        state.valid = false;

        state.querySet = await this.mweService.generateQuery(state.canonicalForm.text);
        state.currentQuery = state.querySet[0];
        state.xpath = state.currentQuery.xpath;

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
            name: 'Treebanks',
            step: new SelectTreebankStep(1, this.treebankService)
        },
        {
            step: new MweResultsStep(2, this.mweService),
            name: 'Results',
        },
        {
            step: new AnalysisStep(3),
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

    async startWithExpression(canonicalForm: {text: string, id?: number}) {
        this.stateService.setState({canonicalForm});
        this.setValid(true);
        this.next();
    }

    proceedWithQuery(query: MweQuery) {
        this.stateService.setState({xpath: query.xpath, currentQuery: query});
        this.setValid(true);
        this.next();
    }

    async updateXPath(xpath: string) {
        this.stateService.setState({xpath});
    }

    changeQuery(query: MweQuery) {
        this.stateService.setState({currentQuery: query});
        this.updateXPath(query.xpath);
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

    updateRetrieveContext(retrieveContext: boolean) {
        this.stateService.setState({ retrieveContext });
    }
}
