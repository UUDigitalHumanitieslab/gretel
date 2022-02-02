import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ExtractinatorService, ReconstructorService } from 'lassy-xpath';

import { AlpinoService, TreebankService, StateService } from '../../services/_index';
import { MatrixSettings } from '../../components/step/matrix/matrix.component';
import {
    GlobalStateExampleBased, SentenceInputStep, ParseStep, SelectTreebankStep, ResultsStep,
    MatrixStep, AnalysisStep, Step
} from '../multi-step-page/steps';
import { MultiStepPageDirective } from '../multi-step-page/multi-step-page.directive';
import { TreebankSelection } from '../../treebank';

const attributesSeparator = ':';

@Component({
    selector: 'grt-example-based-search',
    templateUrl: './example-based-search.component.html',
    styleUrls: ['./example-based-search.component.scss']
})
export class ExampleBasedSearchComponent extends MultiStepPageDirective<GlobalStateExampleBased> {
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
        selectedTreebanks: new TreebankSelection(this.treebankService),
        variableProperties: undefined
    };

    matrixStep: MatrixStep;
    steps: Step<GlobalStateExampleBased>[];

    constructor(
        private alpinoService: AlpinoService,
        private extractinatorService: ExtractinatorService,
        private reconstructorService: ReconstructorService,
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
            'attributes': this.alpinoService.attributesToStrings(state.attributes, true)?.join(attributesSeparator),
            'respectOrder': this.encodeBool(state.respectOrder),
            'ignoreTopNode': this.encodeBool(state.ignoreTopNode)
        });
    }

    decodeGlobalState(queryParams: { [key: string]: any }): { [K in keyof GlobalStateExampleBased]?: GlobalStateExampleBased[K] } {
        return {
            selectedTreebanks: new TreebankSelection(
                this.treebankService,
                queryParams.selectedTreebanks ? JSON.parse(queryParams.selectedTreebanks) : undefined),
            xpath: queryParams.xpath || undefined,
            inputSentence: queryParams.inputSentence || undefined,
            isCustomXPath: this.decodeBool(queryParams.isCustomXPath),
            attributes: this.alpinoService.attributesFromString(queryParams.attributes?.split(attributesSeparator)),
            retrieveContext: this.decodeBool(queryParams.retrieveContext),
            respectOrder: this.decodeBool(queryParams.respectOrder),
            ignoreTopNode: this.decodeBool(queryParams.ignoreTopNode)
        };
    }

    initializeSteps(): { step: Step<GlobalStateExampleBased>, name: string }[] {
        this.matrixStep = new MatrixStep(
            2,
            this.alpinoService,
            this.extractinatorService,
            this.reconstructorService);
        return [{
            name: 'Example',
            step: new SentenceInputStep(0)
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

    updateSentence(sentence: string) {
        this.stateService.setState({
            inputSentence: sentence,
            // reset parse/previous settings
            exampleXml: 'undefined',
            isCustomXPath: false,
            attributes: undefined
        });
    }

    async updateMatrix(matrixSettings: MatrixSettings) {
        const newState: any = {
            loading: true,
            retrieveContext: matrixSettings.retrieveContext,
            ignoreTopNode: matrixSettings.ignoreTopNode,
            respectOrder: matrixSettings.respectOrder
        };

        if (matrixSettings.customXPath) {
            newState.isCustomXPath = true;
            newState.xpath = matrixSettings.customXPath;
        } else {
            newState.isCustomXPath = false;
            newState.tokens = matrixSettings.tokens;
            newState.attributes = matrixSettings.attributes;
        }

        let state: GlobalStateExampleBased = await this.stateService.setState(newState);
        state = await this.matrixStep.updateMatrix(state);
        state.loading = false;
        state = await this.stateService.setState(state);
    }

    updateRetrieveContext(retrieveContext: boolean) {
        this.stateService.setState({ retrieveContext });
    }

    updateXPath(xpath: string) {
        this.stateService.setState({
            xpath,
            isCustomXPath: true
        }, 'history');
    }
}
