import { Component, Input, OnInit } from '@angular/core';
import { AlpinoService } from '../../../services/_index';

@Component({
    selector: 'grt-matrix',
    templateUrl: './matrix.component.html',
    styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent implements OnInit {
    private sentenceValue: string;
    public xml: string;
    public subTreeXml: string;
    public xpath: string;
    public tokens: { value: string, index: number }[];
    public showAdvanced: boolean;
    /**
     * If an advanced option has been selected, the toggle will be disabled.
     */
    public alwaysAdvanced: boolean;

    public tokenValues: Part[];

    public options: Part[] = [
        {
            label: "Word",
            description: "The exact word form (also known as token).",
            value: "token",
            advanced: false
        },
        {
            label: "Word (case-sensitive)",
            description: "The word form must match exactly, including the casing.",
            value: "cs",
            advanced: true
        },
        {
            label: "Lemma",
            description: "Word form that generalizes over inflected forms. For example: gaan is the lemma of ga, gaat, gaan, ging, gingen, and gegaan.",
            value: "lemma",
            advanced: false
        },
        {
            label: "Word class",
            description: "Short Dutch part-of-speech tag. The different tags are: n (noun), ww (verb), adj (adjective), lid (article), vnw (pronoun), vg (conjunction), bw (adverb), tw (numeral), vz (preposition), tsw (interjection), spec (special token), and let (punctuation).",
            value: "pos",
            advanced: false
        },
        {
            label: "Detailed word class",
            description: "Long part-of-speech tag. For example: N(soort,mv,basis), WW(pv,tgw,ev), VNW(pers,pron,nomin,vol,2v,ev).",
            value: "postag",
            advanced: true
        },
        {
            label: "Optional",
            description: "The word will be ignored in the search instruction. It may be included in the results, but it is not required that it is present.",
            value: "na",
            advanced: false
        },
        {
            label: "Exclude",
            description: "The word class and the dependency relation will be explicitly excluded from the results.",
            value: "not",
            advanced: true
        }];

    // TODO: don't reparse
    @Input('sentence')
    set sentence(value: string) {
        this.sentenceValue = value;
        this.xml = null;
        this.tokens = this.alpinoService.tokenize(value).split(' ').map((value, index) => { return { value, index } });
        let defaultValue = this.options.find(o => o.value == 'pos');
        this.tokenValues = this.tokens.map(() => defaultValue);
        this.alpinoService.parseSentence(value).then(xml => this.xml = xml);
    }
    get sentence() {
        return this.sentenceValue;
    }

    constructor(private alpinoService: AlpinoService) {
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
        this.generateXPath();
    }

    async generateXPath() {
        if (this.xml) {
            // TODO: xml required, this needs to be fixed somehow
            let generated = await this.alpinoService.generateXPath(
                this.xml,
                this.tokens.map(t => t.value),
                this.tokenValues.map(t => t.value),
                false,
                false);
            this.subTreeXml = generated.subTree;
            this.xpath = generated.xpath;
        }
    }
}

type Part = {
    label: string,
    description: string,
    value: string,
    advanced: boolean
}
