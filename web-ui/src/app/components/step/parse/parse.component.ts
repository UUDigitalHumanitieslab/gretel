import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AlpinoService } from '../../../services/_index';

@Component({
    selector: 'grt-parse',
    templateUrl: './parse.component.html',
    styleUrls: ['./parse.component.scss']
})
export class ParseComponent implements OnChanges {
    @Input()
    public xml: string;

    @Input('sentence')
    public sentence: string;

    public display = 'inline';

    public url: string

    constructor(private alpinoService: AlpinoService) {
    }

    async ngOnChanges(simpleChanges: SimpleChanges) {
        if (simpleChanges['sentence']) {
            this.url = await this.alpinoService.parseSentenceUrl(this.sentence);
        }
    }
}
