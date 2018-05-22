import { Component, ElementRef, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import * as $ from 'jquery';
import './tree-visualizer';

@Component({
    selector: 'grt-tree-visualizer',
    templateUrl: './tree-visualizer.component.html',
    styleUrls: ['./tree-visualizer.component.scss']
})
export class TreeVisualizerComponent implements OnChanges {
    @Input()
    public xml: string;

    @Input()
    public normalView = false;

    constructor() {
    }

    ngOnChanges() {
        console.log(this.normalView);
        let element: any = $(`.output`);
        element.treeVisualizer(this.xml, {
            // nvFontSize: 14,
            // normalView: false,
            // initFSOnClick: true,
            // fsView: false
        });
    }
}
