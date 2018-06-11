import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { StepComponent } from "../step.component";
import { MacroService, ValueEvent, ReconstructorService, ExtractinatorService, PathVariable } from 'lassy-xpath/ng';

@Component({
    selector: 'grt-xpath-input',
    templateUrl: './xpath-input.component.html',
    styleUrls: ['./xpath-input.component.scss']
})
export class XpathInputComponent extends StepComponent implements OnChanges {
    public treeXml: string;
    public treeDisplay = 'inline';

    private valueSubject = new Subject<string>();
    private subscriptions: Subscription[] = [];

    @Input()
    public value: string;

    @Input()
    public retrieveContext: boolean;

    @Output()
    public onChangeValue = new EventEmitter<string>();

    @Output()
    public onChangeRetrieveContext = new EventEmitter<boolean>();

    constructor(private httpClient: HttpClient, macroService: MacroService,
        extractinatorService: ExtractinatorService,
        reconstructorService: ReconstructorService) {
        super();

        macroService.loadDefault();
        this.subscriptions.push(this.valueSubject.debounceTime(500).subscribe(value => {
            let paths: PathVariable[] = null;
            try {
                paths = extractinatorService.extract(value);
                this.treeXml = reconstructorService.construct(paths, value);
            }
            catch (err) {
                // probably some malformed input
                console.debug(err)
            }
        }));
    }

    valid: boolean = false;

    updateValidity() {
        this.onChangeValid.emit(this.valid);
    }

    getValidationMessage() {
        this.warning = true;
    }

    inputChanged(event: ValueEvent) {
        this.valid = !event.error;
        this.value = event.xpath;
        this.onChangeValue.emit(this.value);
        this.onChangeValid.emit(this.valid);
        this.valueSubject.next(this.value);
    }

    ngOnChanges() {
        this.valueSubject.next(this.value);
    }

    emitRetrieveContextChanged() {
        this.onChangeRetrieveContext.emit(this.retrieveContext);
    }
}
