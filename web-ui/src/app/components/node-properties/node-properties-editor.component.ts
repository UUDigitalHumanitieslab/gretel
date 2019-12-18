import { Component, OnInit, Input } from '@angular/core';
import { SearchVariable } from '../../services/_index';

@Component({
    selector: 'grt-node-properties-editor',
    templateUrl: './node-properties-editor.component.html',
    styleUrls: ['./node-properties-editor.component.scss']
})
export class NodePropertiesEditorComponent implements OnInit {
    @Input()
    nodes: SearchVariable[];

    constructor() { }

    ngOnInit() {
    }
}
