import { Component, Input } from '@angular/core';

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

    constructor() {
    }
}
