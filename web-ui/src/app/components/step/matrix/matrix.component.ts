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
