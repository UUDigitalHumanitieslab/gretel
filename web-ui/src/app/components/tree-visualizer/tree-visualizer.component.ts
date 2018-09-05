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

    @Input()
    public xml: string;

    @Input()
    public display: TreeVisualizerDisplay = 'inline';

    @Input()
    public fullScreenButton = true;

    @Output()
    public onDisplayChange = new EventEmitter<TreeVisualizerDisplay>();

    constructor() {
    }

    ngOnInit() {
        let element = $(this.output.nativeElement);
        this.visualize(element);
        element.on('close', () => {
            if (this.display == 'both') {
                this.onDisplayChange.next('inline')
            }
        });
        this.updateVisibility(element);
    }

    ngOnChanges(changes: TypedChanges) {
        let element = $(this.output.nativeElement);
        if (changes.xml && changes.xml.currentValue != changes.xml.previousValue) {
            this.visualize(element);
        }
        this.updateVisibility(element);
    }

    private visualize(element: any) {
        element.treeVisualizer(this.xml, {
            nvFontSize: 14,
            noFsButton: !this.fullScreenButton
        });
    }

    private updateVisibility(element: JQuery<Element>) {
        let inline = element.children('.tree-visualizer');
        let fullscreen = element.children('.tree-visualizer-fs');

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
