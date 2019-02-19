import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlpinoService } from '../../../services/_index';

@Component({
    selector: 'grt-parse',
    templateUrl: './parse.component.html',
    styleUrls: ['./parse.component.scss']
})
export class ParseComponent {
    @Input()
    public xml: string;

    @Input('sentence')
    public sentence: string;

    public display = 'inline';

    constructor(private alpinoService: AlpinoService) {
    }
}
