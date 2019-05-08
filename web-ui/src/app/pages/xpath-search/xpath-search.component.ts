import { Component, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TreebankService, mapTreebanksToSelectionSettings } from '../../services/treebank.service';
import { MultiStepPageComponent } from '../multi-step-page/multi-step-page.component';
import {
    AnalysisStep,
    GlobalState,
    XpathInputStep,
    ResultStep,
    SelectTreebankStep,
} from '../multi-step-page/steps';
import { map, filter } from 'rxjs/operators';
import { XpathInputComponent } from '../../components/step/xpath-input/xpath-input.component';
import { SelectTreebanksComponent } from '../../components/step/select-treebanks/select-treebanks.component';
import { ResultsComponent } from '../../components/step/results/results.component';

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

    // All the components. used to call functions on.
    @ViewChild('xpathInput')
    xpathInputComponent: XpathInputComponent;
    @ViewChild('selectTreebanksComponentRef')
    selectTreebankComponent: SelectTreebanksComponent;
    @ViewChild('resultsComponentRef')
    resultComponent: ResultsComponent;

    constructor(treebankService: TreebankService, route: ActivatedRoute, router: Router) {
        super(route, router, treebankService);
    }

    ngOnInit() {
        super.ngOnInit();
        this.subscriptions.push(
            this.treebankService.treebanks.pipe(
                // prevent infinite loops as we update the url whenever different banks are selected
                filter(v => v.origin !== 'url' && v.origin !== 'init'),
                map(v => mapTreebanksToSelectionSettings(v.state))
            )
            .subscribe(state => this.updateSelected(state))
        );
    }

    initializeCrumbs() {
        this.crumbs = [
            {
                name: 'XPath',
                number: 0,
            },
            {
                name: 'Treebanks',
                number: 1,
            },
            {
                name: 'Results',
                number: 2,
            },
            {
                name: 'Analysis',
                number: 3,
            },
        ];
    }

    initializeSteps() {
        this.steps = [
            new XpathInputStep(0),
            new SelectTreebankStep(1, this.treebankService),
            new ResultStep(2),
            new AnalysisStep(3)
        ];
    }

    initializeComponents() {
        this.components = [
            this.xpathInputComponent,
            this.selectTreebankComponent,
            this.resultComponent
        ];
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

    initializeConfiguration() {
        this.configuration = {
            steps: this.steps
        };
    }
}
