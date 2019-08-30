import { Component, EventEmitter, Input, OnChanges, Output, OnInit, OnDestroy } from '@angular/core';

import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { StepComponent } from '../step.component';
import { MacroService, ValueEvent, ReconstructorService, ExtractinatorService, PathVariable } from 'lassy-xpath/ng';
import { StateService } from '../../../services/_index';
import { GlobalState, StepType } from '../../../pages/multi-step-page/steps';

@Component({
    selector: 'grt-xpath-input',
    templateUrl: './xpath-input.component.html',
    styleUrls: ['./xpath-input.component.scss']
})
export class XpathInputComponent extends StepComponent<GlobalState> implements OnChanges, OnInit, OnDestroy {
    public stepType = StepType.XpathInput;
    public treeXml: string;
    public treeDisplay = 'inline';
    public warning = false;

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
        reconstructorService: ReconstructorService,
        stateService: StateService<GlobalState>) {
        super(stateService);

        macroService.loadDefault();
        this.subscriptions.push(this.valueSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()).subscribe(value => {
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

    getWarningMessage() {
        return 'Please make sure the xpath query is correct.';
    }

    inputChanged(event: ValueEvent) {
        this.valid = !event.error && !!event.xpath;
        if (this.valid) {
            this.warning = false;
        }
        if (event.xpath !== this.value) {
            this.value = event.xpath;
            this.changeValue.emit(this.value);
        }
        this.changeValid.emit(this.valid);
        this.valueSubject.next(this.value);
    }

    ngOnChanges() {
        this.valueSubject.next(this.value);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
    }

    emitRetrieveContextChanged() {
        this.changeRetrieveContext.emit(this.retrieveContext);
    }
}
