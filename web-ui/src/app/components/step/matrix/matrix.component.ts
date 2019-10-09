import { Component, EventEmitter, Output, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService } from 'primeng/api';

import { ValueEvent } from 'lassy-xpath/ng';

import { StateService } from '../../../services/_index';
import { StepComponent } from '../step.component';
import { StepType, GlobalStateExampleBased } from '../../../pages/multi-step-page/steps';
import { NotificationService } from '../../../services/notification.service';
import { animations } from '../../../animations';

@Component({
    animations,
    selector: 'grt-matrix',
    templateUrl: './matrix.component.html',
    styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent extends StepComponent<GlobalStateExampleBased> implements OnInit, OnDestroy {
    private warningId: number;
    private subscriptions: Subscription[];
    public stepType = StepType.Matrix;

    public set attributes(values: string[]) {
        const tokenValues = values.map(value => {
            const option = this.options.find(o => o.value === value);
            if (option.advanced) {
                this.showAdvanced = true;
            }
            return option;
        });
        if (this.tokenValues &&
            tokenValues.length === this.tokenValues.length) {
            // only update the values, but prevent the whole array
            // from being re-rendered
            for (let i = 0; i < tokenValues.length; i++) {
                Object.assign(this.tokenValues[i], tokenValues[i]);
            }
        } else {
            this.tokenValues = tokenValues;
        }
    }

    public get attributes() {
        return this.tokenValues.map(t => t.value);
    }

    public set tokens(values: string[]) {
        const indexedTokens = values.map((value, index) => ({ value, index }));
        if (this.indexedTokens &&
            indexedTokens.length === this.indexedTokens.length) {
            // only update the values, but prevent the whole array
            // from being re-rendered
            for (let i = 0; i < indexedTokens.length; i++) {
                Object.assign(this.indexedTokens[i], indexedTokens[i]);
            }
        } else {
            this.indexedTokens = indexedTokens;
        }
        this.filename = values.filter(t => t.match(/[^'"-:!?,\.]/)).join('-').toLowerCase() + '.xml';
    }
    public get tokens() {
        return this.indexedTokens.map(t => t.value);
    }

    public subTreeXml: string;
    public xpath: string;
    public isCustomXPath: boolean;
    public respectOrder: boolean;
    public retrieveContext: boolean;
    public ignoreTopNode: boolean;

    @Output()
    public changeValue = new EventEmitter<MatrixSettings>();

    public filename: string;
    public subTreeDisplay = 'inline';
    public warning: boolean;

    public indexedTokens: { value: string, index: number }[];
    public showAdvanced: boolean;
    /**
     * If an advanced option has been selected, the toggle will be disabled.
     */
    public alwaysAdvanced: boolean;

    public tokenValues: Part[];

    public options: Part[] = [
        {
            label: 'Word',
            description: 'The exact word form (also known as token).',
            value: 'token',
            advanced: false
        },
        {
            label: 'Word (case-sensitive)',
            description: 'The word form must match exactly, including the casing.',
            value: 'cs',
            advanced: true
        },
        {
            label: 'Lemma',
            description: `Word form that generalizes over inflected forms.
            For example: gaan is the lemma of ga, gaat, gaan, ging, gingen, and gegaan.`,
            value: 'lemma',
            advanced: false
        },
        {
            label: 'Word class',
            description: `Short Dutch part-of-speech tag.
            The different tags are:
            n (noun), ww (verb), adj (adjective), lid (article), vnw (pronoun),
            vg (conjunction), bw (adverb), tw (numeral), vz (preposition),
            tsw (interjection), spec (special token), and let (punctuation).`,
            value: 'pos',
            advanced: false
        },
        {
            label: 'Detailed word class',
            description: 'Long part-of-speech tag. For example: N(soort,mv,basis), WW(pv,tgw,ev), VNW(pers,pron,nomin,vol,2v,ev).',
            value: 'postag',
            advanced: true
        },
        {
            label: 'Optional',
            description: `The word will be ignored in the search instruction.
            It may be included in the results, but it is not required that it is present.`,
            value: 'na',
            advanced: false
        },
        {
            label: 'Exclude',
            description: 'The word class and the dependency relation will be explicitly excluded from the results.',
            value: 'not',
            advanced: true
        }];

    private originalXPath: string;

    constructor(stateService: StateService<GlobalStateExampleBased>,
        private confirmationService: ConfirmationService,
        private notificationService: NotificationService) {
        super(stateService);
        this.subscriptions = [
            this.state$.subscribe(state => {
                this.attributes = state.attributes;
                this.ignoreTopNode = state.ignoreTopNode;
                this.isCustomXPath = state.isCustomXPath;
                this.respectOrder = state.respectOrder;
                this.retrieveContext = state.retrieveContext;
                this.subTreeXml = state.subTreeXml;
                this.tokens = state.tokens;
                this.xpath = state.xpath;
            })
        ];
    }

    public setTokenPart(tokenIndex: number, part: Part) {
        if (this.isCustomXPath) {
            this.warningId = this.notificationService.addWarning('It is not possible to use the matrix when using custom xpath.');
            return;
        }
        if (part.advanced) {
            this.alwaysAdvanced = true;
        }
        this.tokenValues[tokenIndex] = part;
        if (!part.advanced) {
            this.alwaysAdvanced = !!this.tokenValues.find(value => value.advanced);
        }
        this.emitChange();
    }

    public emitChange(customXPath: string = null, settings: { [key: string]: boolean } = {}) {
        if (customXPath == null) {
            this.valid = true;
        }
        this.changeValue.next(Object.assign({
            attributes: this.tokenValues.map(t => t.value),
            retrieveContext: this.retrieveContext,
            customXPath,
            respectOrder: this.respectOrder,
            tokens: [...this.tokens],
            ignoreTopNode: this.ignoreTopNode
        }, settings));
        this.updateValidity();
    }

    public toggleSetting(key: 'retrieveContext' | 'respectOrder' | 'ignoreTopNode') {
        this.emitChange(null, { [key]: !this[key] });
    }

    public changeCustomXpath(valueEvent: ValueEvent) {
        this.valid = !valueEvent.error && !!valueEvent.xpath;
        if (!!valueEvent.xpath) {
            this.emitChange(valueEvent.xpath);
        }
    }

    public editXPath() {
        this.originalXPath = this.xpath;
        this.emitChange(this.xpath);
    }

    public resetXPath() {
        const reset = () => {
            this.valid = true;
            this.emitChange();
            this.notificationService.cancel(this.warningId);
        };
        if (this.xpath === this.originalXPath) {
            reset();
        } else {
            this.confirmationService.confirm({
                message: 'Are you sure you want to reset your custom XPath query?',
                accept: reset
            });
        }
    }

    private updateValidity() {
        this.changeValid.emit(this.valid);
    }

    public getWarningMessage() {
        this.warning = true;
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        this.notificationService.cancel(this.warningId);
        this.subscriptions.forEach(s => s.unsubscribe());
        super.ngOnDestroy();
    }
}

interface Part {
    label: string;
    description: string;
    value: string;
    advanced: boolean;
}

export interface MatrixSettings {
    attributes: string[];
    customXPath: string;
    retrieveContext: boolean;
    respectOrder: boolean;
    tokens: string[];
    ignoreTopNode: boolean;
}
