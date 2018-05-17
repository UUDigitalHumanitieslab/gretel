import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'grt-parse',
    templateUrl: './parse.component.html',
    styleUrls: ['./parse.component.scss']
})
export class ParseComponent implements OnInit {

    @Input() inputSentence: string;

    constructor() {
    }

    ngOnInit() {
    }

}
