import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { StepComponent } from '../step.component';
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
    public changeValue = new EventEmitter<string>();

    @Output()
    public changeRetrieveContext = new EventEmitter<boolean>();

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
            } catch (err) {
                // probably some malformed input
                console.error(err);
            }
        }));
    }

    valid = false;

    updateValidity() {
        this.changeValid.emit(this.valid);
    }

    getValidationMessage() {
        return 'Please make sure the xpath query is correct.';
    }

    inputChanged(event: ValueEvent) {
        this.valid = !event.error && !!event.xpath;
        if (this.valid) {
            this.warning = false;
        }
        this.value = event.xpath;
        this.changeValue.emit(this.value);
        this.changeValid.emit(this.valid);
        this.valueSubject.next(this.value);
    }

    ngOnChanges() {
        this.valueSubject.next(this.value);
    }

    emitRetrieveContextChanged() {
        this.changeRetrieveContext.emit(this.retrieveContext);
    }
}
