import { Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, Output, ViewChild } from '@angular/core';
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
    public display: 'fullscreen' | 'inline' | 'both' = 'inline';

    @Input()
    public fullScreenButton = true;

    @Output()
    public onDisplayChange = new EventEmitter<TreeVisualizerComponent["display"]>();

    constructor() {
    }

    ngOnChanges() {
        let element: any = $(`.output`);
        element.treeVisualizer(this.xml, {
            nvFontSize: 14,
            noFsButton: !this.fullScreenButton
        });
        element.on('close', () => {
            if (this.display == 'both') {
                this.onDisplayChange.next('inline')
            }
        });
        this.updateVisibility();
    }

    private updateVisibility() {
        if (this.display != 'fullscreen') {
            $('.tree-visualizer').show();
        } else {
            $('.tree-visualizer').hide();
        }

        if (this.display != 'inline') {
            $('.tree-visualizer-fs').show();
        } else {
            $('.tree-visualizer-fs').hide();
        }
    }
}
