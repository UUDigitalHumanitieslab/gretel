import { Component, OnInit, ViewChild } from '@angular/core';
import { Crumb } from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalState, Step, AnalysisStep, XpathInputStep, ResultStep, SelectTreebankStep, TreebankSelection } from "../multi-step-page/steps";
import { Transition, Transitions, IncreaseTransition, DecreaseTransition } from '../multi-step-page/transitions'
import { TreebankService } from "../../services/treebank.service";
import { ResultsService } from "../../services/results.service";
import { MultiStepPageComponent } from "../multi-step-page/multi-step-page.component";

/**
 * The xpath search component is the main component for the xpath search page. It keeps track of global state of the page
 * It uses steps and transitions to determine the next state.
 */

@Component({
    selector: 'grt-x-path-search',
    templateUrl: './xpath-search.component.html',
    styleUrls: ['./xpath-search.component.scss']
})
export class XpathSearchComponent extends MultiStepPageComponent {
    xpathInputStep: XpathInputStep;

    //All the components. used to call functions on.
    @ViewChild('xpathInput')
    xpathInputComponent;
    @ViewChild('selectTreebanksComponentRef')
    selectTreebankComponent;
    @ViewChild('hiddenForm')
    form;
    @ViewChild('resultComponentRef')
    resultComponent;

    constructor(private http: HttpClient, private treebankService: TreebankService, private resultsService: ResultsService) {
        super();
    }

    initializeCrumbs() {
        this.crumbs = [
            {
                name: "XPath",
                number: 0,
            },
            {
                name: "Treebanks",
                number: 1,
            },
            {
                name: "Results",
                number: 2,
            },
            {
                name: "Analysis",
                number: 3,
            },
        ];
    }

    initializeComponents() {
        this.components = [
            this.xpathInputComponent,
            this.selectTreebankComponent,
            this.resultComponent
        ]
    }

    initializeGlobalState() {
        this.xpathInputStep = new XpathInputStep(0);


        this.globalState = {
            selectedTreebanks: undefined,
            currentStep: this.xpathInputStep,
            valid: false,
            xpath: `//node[@cat="smain"
    and node[@rel="su" and @pt="vnw"]
    and node[@rel="hd" and @pt="ww"]
    and node[@rel="predc" and @cat="np"
    and node[@rel="det" and @pt="lid"]
    and node[@rel="hd" and @pt="n"]]]`,
            loading: false
        };
    }

    initializeConfiguration() {
        this.configuration = {
            steps: [
                this.xpathInputStep,
                new SelectTreebankStep(1),
                new ResultStep(2),
                new AnalysisStep(3)
            ]
        };
    }

    initializeTransitions() {
        this.transitions = new Transitions([new IncreaseTransition(this.configuration.steps), new DecreaseTransition(this.configuration.steps)]);
    }

    ngOnInit() {
    }

    /**
     * Sets
     * @param boolean
     */
    setValid(valid: boolean) {
        this.globalState.valid = valid
    }

    /**
     * Updates the selected treebanks with the given selection
     * @param selectedTreebanks the new treebank selection
     */
    updateSelected(selectedTreebanks: TreebankSelection) {
        this.globalState.selectedTreebanks = selectedTreebanks;
    }

    updateXPath(xpath: string) {
        this.globalState.xpath = xpath;
    }
}
