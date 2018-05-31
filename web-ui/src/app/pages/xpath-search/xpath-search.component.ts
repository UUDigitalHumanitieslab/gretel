import {Component, OnInit, ViewChild} from '@angular/core';
import {Crumb} from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {
    GlobalState,
    Step,
    XpathInputStep,
    ResultStep,
    SelectTreebankStep,
    TreebankSelection, AnalysisStep
} from "../multi-step-page/steps";
import {
    Transition, Transitions, IncreaseTransition, DecreaseTransition,
    JumpToStepTransition
} from '../multi-step-page/transitions'
import {TreebankService} from "../../services/treebank.service";
import {ResultsService} from "../../services/results.service";
import {MultiStepPageComponent} from "../multi-step-page/multi-step-page.component";
import {ActivatedRoute, Router} from "@angular/router";

/**
 * The xpath search component is the main component for the xpath search page. It keeps track of global state of the page
 * It uses steps and transitions to determine the next state.
 */
@Component({
    selector: 'grt-x-path-search',
    templateUrl: './xpath-search.component.html',
    styleUrls: ['./xpath-search.component.scss']
})

export class XpathSearchComponent extends MultiStepPageComponent<GlobalState> {
    steps = [
        new XpathInputStep(0),
        new SelectTreebankStep(1),
        new ResultStep(2),
        new AnalysisStep(3)
    ];

    x: any;

    //All the components. used to call functions on.
    @ViewChild('xpathInput')
    xpathInputComponent;
    @ViewChild('selectTreebanksComponentRef')
    selectTreebankComponent;
    @ViewChild('hiddenForm')
    form;
    @ViewChild('resultsComponentRef')
    resultComponent;


    constructor(private http: HttpClient, private treebankService: TreebankService, private resultsService: ResultsService, private route: ActivatedRoute, private router: Router) {
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



    queryParamsToGlobalState(queryParams: any) {

        return {
            selectedTreebanks: queryParams.selectedTreebanks ? JSON.parse(queryParams.selectedTreebanks) : undefined,
            currentStep: this.getStepFromNumber(queryParams.currentStep),
            xpath: queryParams.xpath || '//node',
            valid: false,
            loading: false,
            retrieveContext: false

        }

    }


    /**
     * Sets
     * @param boolean
     */
    setValid(valid: boolean) {
        this.globalState.valid = valid;
    }

    updateRetrieveContext(retrieveContext: boolean) {
        this.globalState.retrieveContext = retrieveContext;
    }
    /**
     * Updates the selected treebanks with the given selection
     * @param selectedTreebanks the new treebank selection
     */
    updateSelected(selectedTreebanks: TreebankSelection) {
        this.globalState.selectedTreebanks = selectedTreebanks;
        this.writeStateToUrl();
    }

    updateSelectedMainTreebank(mainTreebank: string){
        this.globalState.selectedTreebanks.corpus = mainTreebank;
        this.writeStateToUrl();
    }


    updateSelectedSubTreebanks(subTreebanks: string[]){
        this.globalState.selectedTreebanks.components = subTreebanks;
        this.writeStateToUrl();
    }

    updateXPath(xpath: string) {
        this.globalState.xpath = xpath;
        this.writeStateToUrl();
    }


    initializeConfiguration() {
        this.configuration = {
            steps: this.steps

        };
    }




    stateToString(state: GlobalState) {
        return {
            'currentStep': state.currentStep.number,
            'xpath': state.xpath,
            'selectedTreebanks': JSON.stringify(state.selectedTreebanks)
        }
    }


    updateGlobalState(state: GlobalState) {
        this.globalState = state;
        this.writeStateToUrl();
    }



}
