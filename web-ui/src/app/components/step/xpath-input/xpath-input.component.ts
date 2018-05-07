import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { StepComponent } from "../step.component";
import { MacroService, ValueEvent } from 'lassy-xpath/ng';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'grt-xpath-input',
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

    @Output() onChangeValue = new EventEmitter<string>();

    constructor(private httpClient: HttpClient, macroService: MacroService) {
        super();

        macroService.loadDefault();
    }

    valid: boolean = false;

    ngOnInit() {
        //Add the moment it is always valid
        this.onChangeValid.emit(true);
    }

    updateValidity() {
        this.onChangeValid.emit(this.valid);
    }

    showWarning() {
       this.warning = true;
    }

    inputChanged(event: ValueEvent) {
        this.valid = !event.error;
        this.value = event.xpath;
        this.onChangeValue.emit(this.value);
        this.onChangeValid.emit(this.valid);
    }
}
