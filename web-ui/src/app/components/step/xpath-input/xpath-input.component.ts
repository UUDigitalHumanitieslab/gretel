import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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

    constructor(macroService: MacroService,
        extractinatorService: ExtractinatorService,
        reconstructorService: ReconstructorService) {
        super();

        macroService.loadDefault();
        this.subscriptions.push(this.valueSubject.pipe(debounceTime(500)).subscribe(value => {
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
