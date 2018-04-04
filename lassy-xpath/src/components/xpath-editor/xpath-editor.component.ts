import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { XPathEditor } from './xpath-editor';
import { LassyXPathParserService, MacroService } from '../../services/_ng';

@Component({
    selector: 'lx-editor',
    template: `<div #container></div><p class="error-message">{{errorMessage}}</p>`,
    styles: [
        `.error-message {
            color: #d54a4a;
            display: inline-block;
            min-height: 1.5em;
        }`]
})
export class XPathEditorComponent extends XPathEditor implements OnDestroy, OnInit {
    private subscriptions: Subscription[];

    @ViewChild('container')
    public container: ElementRef;

    @Input()
    public autofocus: boolean;

    @Input()
    public value: string;

    @Output()
    public onChange = new EventEmitter<ValueEvent>();

    public errorMessage: string;

    constructor(xpathParserService: LassyXPathParserService, macroService: MacroService) {
        super(xpathParserService, macroService);
    }

    ngOnDestroy() {
        for (let subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions = [];
    }

    ngOnInit() {
        this.initialize(this.container.nativeElement, this.autofocus || false, this.value);
        this.subscriptions = [
            this.valueObservable.subscribe(value => {
                this.value = value;
                this.emitChange();
            }),
            this.errorMessageObservable.subscribe(message => {
                this.errorMessage = message;
                this.emitChange();
            })];
    }

    private emitChange() {
        this.onChange.next({
            xpath: this.value,
            error: this.errorMessage
        });
    }
}

export interface ValueEvent {
    xpath: string,
    error: string | undefined
}
