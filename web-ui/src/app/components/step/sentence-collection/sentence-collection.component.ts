import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';

@Component({
    selector: 'grt-sentence-collection',
    templateUrl: './sentence-collection.component.html',
    styleUrls: ['./sentence-collection.component.scss']
})
export class SentenceCollectionComponent implements OnInit {

    private _sentences: {text:string, id:number}[];

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
    }

    get sentences() {
        return this._sentences.filter((sent) => {
            return sent.text.indexOf(this.filterString) >= 0;
        })
    }

    @Input()
    set sentences(sents) {
        this._sentences = sents;
    }

    ngOnInit(): void {
    }
}
