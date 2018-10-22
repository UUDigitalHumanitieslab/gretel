import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatrixSettings } from '../../components/step/matrix/matrix.component';
import {
    GlobalStateExampleBased, SentenceInputStep, ParseStep, SelectTreebankStep, ResultStep,
    MatrixStep, TreebankSelection, AnalysisStep, Step
} from '../multi-step-page/steps';
import { MultiStepPageComponent } from '../multi-step-page/multi-step-page.component';
import { AlpinoService } from '../../services/_index';

@Component({
    selector: 'grt-example-based-search',
    templateUrl: './example-based-search.component.html',
    styleUrls: ['./example-based-search.component.scss']
})
export class ExampleBasedSearchComponent extends MultiStepPageComponent<GlobalStateExampleBased> {
    protected defaultGlobalState: GlobalStateExampleBased = {
        exampleXml: undefined,
        subTreeXml: undefined,
        selectedTreebanks: undefined,
        currentStep: undefined,
        filterValues: {},
        valid: true,
        xpath: undefined,
        loading: false,
        inputSentence: 'Dit is een voorbeeldzin.',
        isCustomXPath: false,
        attributes: [],
        tokens: [],
        retrieveContext: false,
        respectOrder: false,
        ignoreTopNode: false
    };

    sentenceInputStep: SentenceInputStep<GlobalStateExampleBased>;
    matrixStep: MatrixStep;
    steps: Step<GlobalStateExampleBased>[];

    @ViewChild('sentenceInput')
    sentenceInputComponent;
    @ViewChild('parse')
    parseComponent;
    @ViewChild('matrix')
    matrixComponent;
    @ViewChild('selectTreebanks')
    selectTreebanksComponent;
    @ViewChild('results')
    resultsComponent;
    @ViewChild('analysis')
    analysisComponent;

    constructor(private alpinoService: AlpinoService, route: ActivatedRoute, router: Router) {
        super(route, router);
    }

    initializeCrumbs() {
        this.crumbs = [
            {
                name: 'Example',
                number: 0,
            },
            {
                name: 'Parse',
                number: 1,
            },
            {
                name: 'Matrix',
                number: 2,
            },
            {
                name: 'Treebanks',
                number: 3,
            },
            {
                name: 'Results',
                number: 4,
            },
            {
                name: 'Analysis',
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
        ];
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

    decodeGlobalState(queryParams) {
        return {
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
    }

    initializeSteps() {
        this.matrixStep = new MatrixStep(2, this.alpinoService);
        this.sentenceInputStep = new SentenceInputStep(0);
        this.steps = [
            this.sentenceInputStep,
            new ParseStep(1, this.alpinoService),
            this.matrixStep,
            new SelectTreebankStep(3),
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
    updateSelected(selectedTreebanks: TreebankSelection) {
        this.globalState.selectedTreebanks = selectedTreebanks;
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
