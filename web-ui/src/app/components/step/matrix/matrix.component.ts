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
    public xpath: string;
    public tokens: string[];
    public showAdvanced: boolean;

    public parts = [
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
            value: "",
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
        this.tokens = this.alpinoService.tokenize(value).split(' ');
        this.alpinoService.parseSentence(value).toPromise().then(xml => this.xml = xml);
    }
    get sentence() {
        return this.sentenceValue;
    }

    constructor(private alpinoService: AlpinoService) {
    }

    ngOnInit() {
    }
}
