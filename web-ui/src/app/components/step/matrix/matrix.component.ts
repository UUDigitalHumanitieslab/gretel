import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlpinoService } from '../../../services/_index';
import { StepComponent } from '../step.component';
import { ValueEvent } from 'lassy-xpath/ng';

@Component({
    selector: 'grt-matrix',
    templateUrl: './matrix.component.html',
    styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent extends StepComponent implements OnInit {
    @Input('attributes')
    public set attributes(values: string[]) {
        this.tokenValues = values.map(value => {
            const option = this.options.find(o => o.value === value);
            if (option.advanced) {
                this.showAdvanced = true;
            }
            return option;
        });
    }

    public get attributes() {
        return this.tokenValues.map(t => t.value);
    }

    @Input('tokens')
    public set tokens(values: string[]) {
        this.indexedTokens = values.map((value, index) => ({ value, index }));
        this.filename = values.filter(t => t.match(/[^'"-:!?,\.]/)).join('-').toLowerCase() + '.xml';
    }
    public get tokens() {
        return this.indexedTokens.map(t => t.value);
    }

    @Input()
    public subTreeXml: string;
    @Input()
    public xpath: string;
    @Input()
    public isCustomXPath: boolean;
    @Input()
    public respectOrder: boolean;
    @Input()
    public retrieveContext: boolean;
    @Input()
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

    constructor(private alpinoService: AlpinoService) {
        super();
    }

    ngOnInit() {
    }

    public setTokenPart(tokenIndex: number, part: Part) {
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

    public customXPathChanged(valueEvent: ValueEvent) {
        this.valid = !valueEvent.error && !!valueEvent.xpath;
        if (!!valueEvent.xpath) {
            this.emitChange(valueEvent.xpath);
        }
    }

    public editXPath() {
        this.emitChange(this.xpath);
    }

    public resetXPath() {
        this.valid = true;
        this.emitChange();
    }

    public updateValidity() {
        this.changeValid.emit(this.valid);
    }

    public getValidationMessage() {
        this.warning = true;
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
