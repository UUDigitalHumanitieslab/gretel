import { Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, Output, ViewChild, SimpleChange } from '@angular/core';
import * as $ from 'jquery';
import './tree-visualizer';

type TypedChanges = { [name in keyof TreeVisualizerComponent]: SimpleChange };
type TreeVisualizerDisplay = 'fullscreen' | 'inline' | 'both';

@Component({
    selector: 'grt-tree-visualizer',
    templateUrl: './tree-visualizer.component.html',
    styleUrls: ['./tree-visualizer.component.scss']
})
export class TreeVisualizerComponent implements OnChanges, OnInit {
    @ViewChild('output', { read: ElementRef })
    public output: ElementRef;
    @ViewChild('inline', { read: ElementRef })
    public inlineRef: ElementRef;
    @ViewChild('fullScreen', { read: ElementRef })
    public fullScreenRef: ElementRef;

    @Input()
    public xml: string;

    @Input()
    public display: TreeVisualizerDisplay = 'inline';

    @Input()
    public fullScreenButton = true;

    @Input()
    public showMatrixDetails: boolean;

    @Output()
    public onDisplayChange = new EventEmitter<TreeVisualizerDisplay>();

    constructor() {
    }

    ngOnInit() {
        let element = $(this.output.nativeElement);
        element.on('close', () => {
            if (this.display == 'both') {
                this.onDisplayChange.next('inline')
            }
        });
        this.updateVisibility();
    }

    ngOnChanges(changes: TypedChanges) {
        let element = $(this.output.nativeElement);
        if (changes.xml && changes.xml.currentValue != changes.xml.previousValue) {
            this.visualize(element);
        }
        this.updateVisibility();
    }

    private visualize(element: any) {
        setTimeout(() => {
            // Make sure the visualization happens after the
            // view (which acts a placeholder) has been rendered.
            element.treeVisualizer(this.xml, {
                nvFontSize: 14,
                showMatrixDetails: this.showMatrixDetails
            });
        });
    }

    private updateVisibility() {
        let inline = $(this.inlineRef && this.inlineRef.nativeElement);
        let fullscreen = $(this.fullScreenRef && this.fullScreenRef.nativeElement);

        if (this.display != 'fullscreen') {
            inline.show();
        } else {
            inline.hide();
        }

        if (this.display != 'inline') {
            fullscreen.show();
        } else {
            fullscreen.hide();
        }
    }
}
