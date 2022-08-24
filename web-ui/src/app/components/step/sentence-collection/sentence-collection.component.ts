import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

const STEP: number = 20;

@Component({
    selector: 'grt-sentence-collection',
    templateUrl: './sentence-collection.component.html',
    styleUrls: ['./sentence-collection.component.scss']
})
export class SentenceCollectionComponent implements OnInit {

    private _sentences: {text:string, id:number}[];
    private limit: number;

    filterString: string;

    @Input()
    title: string;

    @Output()
    onSelect = new EventEmitter<string>();

    @Output()
    onUpdateFilter = new EventEmitter<string>();

    constructor() {
        this.filterString = '';
        this._sentences = [];
        this.limit = STEP;
    }

    filteredSentences() {
        return this._sentences.filter((sent) => {
            let words = this.filterString.split(/\s+/);
            let match = true;
            words.forEach((word) => {
                match &&= (sent.text.indexOf(word) >= 0);
            });
            return match;
        })
    }
    get sentences() {
        return this.filteredSentences().slice(0, this.limit);
    }

    @Input()
    set sentences(sents) {
        this._sentences = sents;
    }

    ngOnInit(): void {
    }

    count(): number {
        return this.filteredSentences().length;
    }

    visible(): number {
        return Math.min(this.count(), this.limit);
    }

    showMore(): void {
        this.limit += STEP;
    }
}
