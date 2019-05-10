import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { StateService, TreebankService, mapTreebanksToSelectionSettings } from '../../services/_index';
import { MultiStepPageComponent } from '../multi-step-page/multi-step-page.component';
import {
    AnalysisStep,
    GlobalState,
    XpathInputStep,
    ResultsStep,
    SelectTreebankStep,
    Step,
} from '../multi-step-page/steps';

/**
 * The xpath search component is the main component for the xpath search page. It keeps track of global state of the page
 * It uses steps and transitions to determine the next state.
 */
@Component({
    selector: 'grt-xpath-search',
    templateUrl: './xpath-search.component.html',
    styleUrls: ['./xpath-search.component.scss']
})
export class XpathSearchComponent extends MultiStepPageComponent<GlobalState> implements OnInit {
    protected defaultGlobalState: GlobalState = {
        connectionError: false,
        currentStep: undefined,
        filterValues: {},
        retrieveContext: false,
        selectedTreebanks: [],
        xpath: `//node[@cat="smain"
    and node[@rel="su" and @pt="vnw"]
    and node[@rel="hd" and @pt="ww"]
    and node[@rel="predc" and @cat="np"
        and node[@rel="det" and @pt="lid"]
        and node[@rel="hd" and @pt="n"]]]`,
        valid: true,
        loading: false
    };

    constructor(treebankService: TreebankService, stateService: StateService<GlobalState>, route: ActivatedRoute, router: Router) {
        super(route, router, treebankService, stateService);
    }

    initializeSteps(): { step: Step<GlobalState>, name: string }[] {
        return [{
            step: new XpathInputStep(0),
            name: 'XPath'
        }, {
            step: new SelectTreebankStep(1, this.treebankService),
            name: 'Treebanks'
        }, {
            step: new ResultsStep(2),
            name: 'Results'
        }, {
            step: new AnalysisStep(3),
            name: 'Analysis'
        }];
    }

    decodeGlobalState(queryParams: { [key: string]: any }) {
        const globalState = {
            step: parseInt(queryParams.currentStep || '0', 10),
            state: {
                selectedTreebanks: queryParams.selectedTreebanks ? JSON.parse(queryParams.selectedTreebanks) : undefined,
                xpath: queryParams.xpath || undefined,
                retrieveContext: this.decodeBool(queryParams.retrieveContext)
            }
        };

        return globalState;
    }

    /**
     * Updates the selected treebanks with the given selection
     * @param selectedTreebanks the new treebank selection
     */
    updateSelected(selectedTreebanks: ReturnType<typeof mapTreebanksToSelectionSettings>) {
        this.globalState.selectedTreebanks = selectedTreebanks;
        this.updateGlobalState(this.globalState);
    }

    updateRetrieveContext(retrieveContext: boolean) {
        this.globalState.retrieveContext = retrieveContext;
        this.updateUrl(false);
    }

    updateXPath(xpath: string, writeState: boolean) {
        this.globalState.xpath = xpath;
        this.updateUrl(writeState);
    }
}
