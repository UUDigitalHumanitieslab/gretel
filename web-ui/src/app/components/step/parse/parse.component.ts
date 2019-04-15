import { Component, Input, OnChanges, SimpleChanges, EventEmitter, Output, OnInit } from '@angular/core';
import { AlpinoService } from '../../../services/_index';
import { StepComponent } from '../step.component';

@Component({
    selector: 'grt-parse',
    templateUrl: './parse.component.html',
    styleUrls: ['./parse.component.scss']
})
export class ParseComponent extends StepComponent implements OnInit {
    @Input() public sentence: string;
    @Output() public changeXml = new EventEmitter<string>();

    public display = 'inline';
    public loading = true;
    public xml: string;
    public validationMessage?: string;

    constructor(private alpinoService: AlpinoService) {
        super();
    }

    ngOnInit() {
        const self = this;
        self.loading = true;
        this.alpinoService.parseSentence(this.sentence)
        .then(xml => {
            self.xml = xml;
            self.valid = true;
            self.warning = false;
            self.validationMessage = undefined;
        })
        .catch(e => {
            self.xml = undefined;
            self.valid = false;
            self.warning = true;
            self.validationMessage = `Error parsing sentence: ${e.message}`;
        })
        .finally(() => {
            self.loading = false;
            self.updateValidity();
            self.changeXml.emit(self.xml);
        });
    }

    public getValidationMessage(): string|void {
        return undefined; // we display our own error
    }

    public updateValidity() {
        this.changeValid.emit(this.valid);
    }
}
