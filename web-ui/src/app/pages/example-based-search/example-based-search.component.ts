import { Component, OnInit, ViewChild } from '@angular/core';
import { Crumb } from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import { MatrixSettings, MatrixComponent } from '../../components/step/matrix/matrix.component';
import {
    GlobalStateExampleBased, XpathInputStep, SentenceInputStep, ParseStep, SelectTreebankStep, ResultStep,
    MatrixStep, AnalysisStep, Step, GlobalState
} from "../multi-step-page/steps";
import { DecreaseTransition, IncreaseTransition, Transitions } from "../multi-step-page/transitions";
import { MultiStepPageComponent } from "../multi-step-page/multi-step-page.component";
import { AlpinoService, TreebankService, mapTreebanksToSelectionSettings } from '../../services/_index';
import { ActivatedRoute, Router } from "@angular/router";
import { filter, map } from 'rxjs/operators';
import { SentenceInputComponent } from '../../components/step/sentence-input/sentence-input.component';
import { ParseComponent } from '../../components/step/parse/parse.component';
import { SelectTreebanksComponent } from '../../components/step/select-treebanks/select-treebanks.component';
import { ResultsComponent } from '../../components/step/results/results.component';
import { AnalysisComponent } from '../../components/analysis/analysis.component';
@Component({
    selector: 'grt-example-based-search',
    templateUrl: './example-based-search.component.html',
    styleUrls: ['./example-based-search.component.scss']
})
export class ExampleBasedSearchComponent extends MultiStepPageComponent<GlobalStateExampleBased> {
    protected defaultGlobalState: GlobalStateExampleBased = {
        exampleXml: undefined,
        subTreeXml: undefined,
        currentStep: undefined,
        valid: true,
        xpath: undefined,
        loading: false,
        inputSentence: 'Dit is een voorbeeldzin.',
        isCustomXPath: false,
        attributes: [],
        tokens: [],
        retrieveContext: false,
        respectOrder: false,
        ignoreTopNode: false,
        selectedTreebanks: [],
    };

    sentenceInputStep: SentenceInputStep<GlobalStateExampleBased>;
    matrixStep: MatrixStep;
    steps: Step<GlobalStateExampleBased>[];

    @ViewChild('sentenceInput')
    sentenceInputComponent: SentenceInputComponent;
    @ViewChild('parse')
    parseComponent: ParseComponent;
    @ViewChild('matrix')
    matrixComponent: MatrixComponent;
    @ViewChild('selectTreebanks')
    selectTreebanksComponent: SelectTreebanksComponent;
    @ViewChild('results')
    resultsComponent: ResultsComponent;
    @ViewChild('analysis')
    analysisComponent: AnalysisComponent;

    constructor(private alpinoService: AlpinoService, private treebankService: TreebankService, route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    ngOnInit() {
        super.ngOnInit();
        this.subscriptions.push(
            this.treebankService.treebanks
            .pipe(
                filter(v => v.origin !== 'url' && v.origin !== 'init'), // prevent infinite loops as we update the url whenever different banks are selected
                map(v => mapTreebanksToSelectionSettings(v.state))
            )
            .subscribe(state => this.updateSelected(state))
        );
    }

    initializeCrumbs() {
        this.crumbs = [
            {
                name: "Example",
                number: 0,
            },
            {
                name: "Parse",
                number: 1,
            },
            {
                name: "Matrix",
                number: 2,
            },
            {
                name: "Treebanks",
                number: 3,
            },
            {
                name: "Results",
                number: 4,
            },
            {
                name: "Analysis",
                number: 5,
            },
        ];
    }

    initializeComponents() {
        this.components = [
            this.sentenceInputComponent,
            this.parseComponent,
            this.matrixComponent,
            this.selectTreebanksComponent,
            this.resultsComponent,
            this.analysisComponent
        ]
    }

    encodeGlobalState(state: GlobalStateExampleBased) {
        return Object.assign(
            super.encodeGlobalState(state), {
                'inputSentence': state.inputSentence,
                'isCustomXPath': this.encodeBool(state.isCustomXPath),
                'attributes': state.attributes,
                'respectOrder': this.encodeBool(state.respectOrder),
                'ignoreTopNode': this.encodeBool(state.ignoreTopNode)
            });
    }

    decodeGlobalState(queryParams: {[key: string]: any}) {
        const globalState = {
            step: queryParams.currentStep || 0 as number,
            state: {
                selectedTreebanks: queryParams.selectedTreebanks ? JSON.parse(queryParams.selectedTreebanks) : undefined,
                xpath: queryParams.xpath || undefined,
                inputSentence: queryParams.inputSentence || undefined,
                isCustomXPath: this.decodeBool(queryParams.isCustomXPath),
                attributes: queryParams.attributes,
                retrieveContext: this.decodeBool(queryParams.retrieveContext),
                respectOrder: this.decodeBool(queryParams.respectOrder),
                ignoreTopNode: this.decodeBool(queryParams.ignoreTopNode)
            }
        };

        this.treebankService.select(globalState.state.selectedTreebanks);
        return globalState;
    }

    initializeSteps() {
        this.matrixStep = new MatrixStep(2, this.alpinoService);
        this.sentenceInputStep = new SentenceInputStep(0);
        this.steps = [
            this.sentenceInputStep,
            new ParseStep(1, this.alpinoService),
            this.matrixStep,
            new SelectTreebankStep(3, this.treebankService),
            new ResultStep(4),
            new AnalysisStep(5)
        ];
    }

    initializeConfiguration() {
        this.configuration = {
            steps: this.steps
        };
    }

    /**
     * Updates the selected treebanks with the given selection
     * @param selectedTreebanks the new treebank selection
     */
    updateSelected(selectedTreebanks: ReturnType<typeof mapTreebanksToSelectionSettings>) {
        this.globalState.selectedTreebanks = selectedTreebanks;
        this.updateGlobalState(this.globalState);
    }

    updateSentence(sentence: string) {
        this.globalState.inputSentence = sentence;
        // reset parse/previous settings
        this.globalState.exampleXml = undefined;
        this.globalState.isCustomXPath = false;
        this.updateGlobalState(this.globalState);
    }

    updateMatrix(matrixSettings: MatrixSettings) {
        this.globalState.retrieveContext = matrixSettings.retrieveContext;
        this.globalState.ignoreTopNode = matrixSettings.ignoreTopNode;
        this.globalState.respectOrder = matrixSettings.respectOrder;
        if (matrixSettings.customXPath) {
            this.globalState.isCustomXPath = true;
            this.globalState.xpath = matrixSettings.customXPath;
        } else {
            this.globalState.isCustomXPath = false;
            this.globalState.tokens = matrixSettings.tokens;
            this.globalState.attributes = matrixSettings.attributes;
            this.matrixStep.updateMatrix(this.globalState);
        }
    }

    updateRetrieveContext(retrieveContext: boolean) {
        this.globalState.retrieveContext = retrieveContext;

        this.updateGlobalState(this.globalState);
    }

    updateXPath(xpath: string) {
        this.globalState.xpath = xpath;
        this.globalState.isCustomXPath = true;

        this.updateGlobalState(this.globalState);
    }
}
