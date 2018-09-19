import { Component, ElementRef, EventEmitter, Input, OnInit, OnChanges, Output, ViewChild, SimpleChange, SecurityContext } from '@angular/core';
import * as $ from 'jquery';
import './tree-visualizer';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

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
    @Input()
    public xml: string;

    @Input()
    public sentence: SafeHtml;

    @Input()
    public display: TreeVisualizerDisplay = 'inline';

    @Input()
    public fullScreenButton = true;

    @Input()
    public showMatrixDetails: boolean;

    @Output()
    public onDisplayChange = new EventEmitter<TreeVisualizerDisplay>();

    // jquery tree visualizer
    private instance: any;

    constructor(private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        let element = $(this.output.nativeElement);
        element.on('close', () => {
            if (this.display == 'both') {
                this.onDisplayChange.next('inline')
            }
        });
    }

    ngOnChanges(changes: TypedChanges) {
        let element = $(this.output.nativeElement);
        if (changes.xml && changes.xml.currentValue != changes.xml.previousValue) {
            this.visualize(element);
        }
    }

    private visualize(element: any) {
        setTimeout(() => {
            // Make sure the visualization happens after the
            // view (which acts a placeholder) has been rendered.
            this.instance = element.treeVisualizer(this.xml, {
                nvFontSize: 14,
                sentence: (this.sentence && this.sanitizer.sanitize(SecurityContext.HTML, this.sentence)) || '',
                showMatrixDetails: this.showMatrixDetails
            });

            this.updateVisibility();
        });
    }

    private updateVisibility() {
        let inline = $(this.inlineRef && this.inlineRef.nativeElement);

        if (this.display != 'fullscreen') {
            inline.show();
        } else {
            inline.hide();
        }

        if (this.display != 'inline') {
            this.instance.trigger('open-fullscreen');
        } else {
            this.instance.trigger('close-fullscreen');
        }
    }
}
