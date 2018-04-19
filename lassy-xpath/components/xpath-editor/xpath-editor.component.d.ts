import { ElementRef, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { XPathEditor } from './xpath-editor';
import { LassyXPathParserService, MacroService } from '../../services/_ng';
export declare class XPathEditorComponent extends XPathEditor implements OnDestroy, OnInit {
    private subscriptions;
    container: ElementRef;
    autofocus: boolean;
    value: string;
    onChange: EventEmitter<ValueEvent>;
    errorMessage: string;
    constructor(xpathParserService: LassyXPathParserService, macroService: MacroService);
    ngOnDestroy(): void;
    ngOnInit(): void;
    private emitChange();
}
export interface ValueEvent {
    xpath: string;
    error: string | undefined;
}
