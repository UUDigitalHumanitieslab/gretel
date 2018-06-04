import { Component, Input, OnInit } from '@angular/core';
import { AlpinoService } from '../../../services/_index';

@Component({
    selector: 'grt-parse',
    templateUrl: './parse.component.html',
    styleUrls: ['./parse.component.scss']
})
export class ParseComponent implements OnInit {
    @Input()
    public xml: string;

    @Input('sentence')
    public sentence: string;

    constructor(private alpinoService: AlpinoService) {
    }

    ngOnInit() {
    }

}
