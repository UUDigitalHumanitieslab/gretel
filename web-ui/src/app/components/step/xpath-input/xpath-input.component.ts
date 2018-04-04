import { Component, Input, OnInit } from '@angular/core';
import { StepComponent } from "../step.component";
import { LassyXPathParserService, MacroService, ValueEvent } from 'lassy-xpath/ng';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-xpath-input',
    templateUrl: './xpath-input.component.html',
    styleUrls: ['./xpath-input.component.scss']
})
export class XpathInputComponent extends StepComponent implements OnInit {
    // TODO: might want to detect changes afterwards?
    @Input()
    public value: string = `//node[@cat="smain"
    and node[@rel="su" and @pt="vnw"]
    and node[@rel="hd" and @pt="ww"]
    and node[@rel="predc" and @cat="np"
    and node[@rel="det" and @pt="lid"]
    and node[@rel="hd" and @pt="n"]]]`;

    constructor(private lassyXPathService: LassyXPathParserService, private httpClient: HttpClient, macroService: MacroService) {
        super();

        // TODO: configuration? maybe move to node_module?
        this.httpClient.get('/gretel/macros.txt', { responseType: 'text' }).toPromise().then(data => {
            macroService.loadFromText(data);
        });
    }

    valid: boolean = false;

    ngOnInit() {
    }

    checkIfValid() {
        this.isValid.emit(this.valid);
    }

    showWarning() {
        console.log("Warning")
    }

    inputChanged(event: ValueEvent) {
        this.valid = !event.error;
        this.value = event.xpath;
    }
}
