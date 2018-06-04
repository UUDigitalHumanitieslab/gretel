import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ValueEvent } from "lassy-xpath/ng";

@Component({
    selector: 'grt-xpath-editor',
    templateUrl: './xpath-editor.component.html',
    styleUrls: ['./xpath-editor.component.scss']
})
/**
 * Wrapper class for having a uniform styling of the editor.
 */
export class XPathEditorComponent {
    @Input()
    public value: string;

    @Output()
    public onChange = new EventEmitter<ValueEvent>();
}
