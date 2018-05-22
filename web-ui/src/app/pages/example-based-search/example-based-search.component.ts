import { Component, OnInit, ViewChild } from '@angular/core';
import { Crumb } from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import { GlobalState, XpathInputStep, SentenceInputStep, ParseStep, SelectTreebankStep, ResultStep, MatrixStep } from "../multi-step-page/steps";
import { DecreaseTransition, IncreaseTransition, Transitions } from "../multi-step-page/transitions";
import { MultiStepPageComponent } from "../multi-step-page/multi-step-page.component";

@Component({
    selector: 'grt-example-based-search',
    templateUrl: './example-based-search.component.html',
    styleUrls: ['./example-based-search.component.scss']
})
export class ExampleBasedSearchComponent extends MultiStepPageComponent {
    sentenceInputStep: SentenceInputStep;

    @ViewChild('sentenceInput')
    sentenceInputComponent;
    @ViewChild('parse')
    parseComponent;

    constructor() {
        super();
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
                name: "Query",
                number: 4,
            },
            {
                name: "Results",
                number: 5,
            },
            {
                name: "Analysis",
                number: 6,
            },
        ];
    }

    initializeComponents() {
        this.components = [
            this.sentenceInputComponent,
            this.parseComponent
        ]
    }

    initializeGlobalState() {
        this.sentenceInputStep = new SentenceInputStep(0);
        this.globalState = {
            selectedTreebanks: undefined,
            currentStep: this.sentenceInputStep,
            valid: false,
            xpath: '',
            loading: false
        };
    }

    initializeConfiguration() {
        this.configuration = {
            steps: [
                this.sentenceInputStep,
                new ParseStep(1),
                new MatrixStep(2),
                new SelectTreebankStep(3),
                new ResultStep(4),
            ]
        };
    }

    initializeTransitions() {
        this.transitions = new Transitions([new IncreaseTransition(this.configuration.steps), new DecreaseTransition(this.configuration.steps)]);
    }

    updateSentence(sentence: string) {
        this.globalState.inputSentence = sentence;
    }
}
