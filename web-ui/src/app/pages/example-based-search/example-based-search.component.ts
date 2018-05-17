import { Component, OnInit } from '@angular/core';
import {Crumb} from "../../components/breadcrumb-bar/breadcrumb-bar.component";
import {GlobalState, XpathInputStep, SentenceInputStep} from "../multi-step-page/steps";
import {DecreaseTransition, IncreaseTransition, Transitions} from "../multi-step-page/transitions";
import {MultiStepPageComponent} from "../multi-step-page/multi-step-page.component";

@Component({
  selector: 'grt-example-based-search',
  templateUrl: './example-based-search.component.html',
  styleUrls: ['./example-based-search.component.scss']
})
export class ExampleBasedSearchComponent extends MultiStepPageComponent{
    sentenceInputStep: SentenceInputStep;

    constructor() {
        super();
    }


    initializeCrumbs(){
        this.crumbs = [
            {
                name: "Example",
                number: 1,
            },
            {
                name: "Parse",
                number: 2,
            },
            {
                name: "matrix",
                number: 3,
            },
            {
                name: "Treebanks",
                number: 4,
            },
            {
                name: "Query",
                number: 5,
            },
            {
                name: "Results",
                number: 6,
            },
            {
                name: "Analysis",
                number: 7,
            },
        ];
    }

    initializeGlobalState(){
        this.sentenceInputStep = new SentenceInputStep(0);
        this.globalState = {
            selectedTreebanks: undefined,
            currentStep: this.sentenceInputStep,
            valid: false,
            xpath: '',
            loading: false
        };
    }

    initializeConfiguration(){

        this.configuration = {
            steps: [
                this.sentenceInputStep
            ]

        };
    }

    initializeTransitions(){
        this.transitions = new Transitions([new IncreaseTransition(this.configuration.steps), new DecreaseTransition(this.configuration.steps)]);
    }







}
