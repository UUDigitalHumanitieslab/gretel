import { Component, Input, OnInit } from '@angular/core';
import { AlpinoService } from '../../../services/_index';

@Component({
    selector: 'grt-parse',
    templateUrl: './parse.component.html',
    styleUrls: ['./parse.component.scss']
})
export class ParseComponent implements OnInit {
    private sentenceValue: string;
    public xml: string;

    @Input('sentence')
    set sentence(value: string) {
        this.sentenceValue = value;
        this.xml = null;
        this.alpinoService.parseSentence(value).then(xml => {
            this.xml = xml;
        });
    }
    get sentence() {
        return this.sentenceValue;
    }

    constructor(private alpinoService: AlpinoService) {
    }

    ngOnInit() {
    }

}
