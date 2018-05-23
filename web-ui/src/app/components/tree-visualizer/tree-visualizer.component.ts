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
    public fullScreen = false;

    constructor() {
    }

    ngOnChanges() {
        let element: any = $(`.output`);
        element.treeVisualizer(this.xml, {
            nvFontSize: 14,
            //normalView: true,
            initFSOnClick: this.fullScreen
            //fsView: false
        });

        if(! this.fullScreen){
            const tree = document.getElementsByClassName('tree-visualizer')[0];
            tree.setAttribute("style", "");
        }

    }
}
