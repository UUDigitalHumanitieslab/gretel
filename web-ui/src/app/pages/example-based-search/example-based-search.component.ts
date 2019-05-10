import { Component } from '@angular/core';
import { MatrixSettings } from '../../components/step/matrix/matrix.component';
import {
    GlobalStateExampleBased, SentenceInputStep, ParseStep, SelectTreebankStep, ResultsStep,
    MatrixStep, AnalysisStep, Step
} from '../multi-step-page/steps';
import { MultiStepPageComponent } from '../multi-step-page/multi-step-page.component';
import { AlpinoService, TreebankService, mapTreebanksToSelectionSettings, StateService } from '../../services/_index';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'grt-example-based-search',
    templateUrl: './example-based-search.component.html',
    styleUrls: ['./example-based-search.component.scss']
})
export class ExampleBasedSearchComponent extends MultiStepPageComponent<GlobalStateExampleBased> {
    protected defaultGlobalState: GlobalStateExampleBased = {
        exampleXml: undefined,
        subTreeXml: undefined,
        connectionError: false,
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
        ignoreTopNode: false,
        selectedTreebanks: [],
    };

    sentenceInputStep: SentenceInputStep<GlobalStateExampleBased>;
    matrixStep: MatrixStep;
    steps: Step<GlobalStateExampleBased>[];

    constructor(
        private alpinoService: AlpinoService,
        treebankService: TreebankService,
        stateService: StateService<GlobalStateExampleBased>,
        route: ActivatedRoute,
        router: Router) {
        super(route, router, treebankService, stateService);
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

    decodeGlobalState(queryParams: { [key: string]: any }) {
        const globalState = {
            step: parseInt(queryParams.currentStep || 0, 10),
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

        return globalState;
    }

    initializeSteps(): { step: Step<GlobalStateExampleBased>, name: string }[] {
        this.matrixStep = new MatrixStep(2, this.alpinoService);
        this.sentenceInputStep = new SentenceInputStep(0);
        return [{
            name: 'Example',
            step: this.sentenceInputStep
        },
        {
            name: 'Parse',
            step: new ParseStep(1, this.alpinoService)
        },
        {
            name: 'Matrix',
            step: this.matrixStep
        },
        {
            name: 'Treebanks',
            step: new SelectTreebankStep(3, this.treebankService)
        },
        {
            name: 'Results',
            step: new ResultsStep(4)
        },
        {
            name: 'Analysis',
            step: new AnalysisStep(5)
        }];
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
        this.globalState.attributes = undefined;
        this.updateGlobalState(this.globalState);
    }

    async updateMatrix(matrixSettings: MatrixSettings) {
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
            this.globalState = await this.matrixStep.updateMatrix(this.globalState);
        }
        this.updateGlobalState(this.globalState);
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
