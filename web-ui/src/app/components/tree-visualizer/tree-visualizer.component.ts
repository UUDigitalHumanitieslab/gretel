import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    OnChanges,
    Output,
    SecurityContext,
    SimpleChange,
    ViewChild,
} from '@angular/core';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

import * as $ from 'jquery';

import { DownloadService, XmlParseService } from '../../services/_index';
import './tree-visualizer';

type TypedChanges = { [name in keyof TreeVisualizerComponent]: SimpleChange };
type TreeVisualizerDisplay = 'fullscreen' | 'inline' | 'both';
interface Metadata {
    name: string;
    /**
     * This can contain xml entities, display using innerHTML
     */
    value: string;
}

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
    public filename: string;

    @Input()
    public display: TreeVisualizerDisplay = 'inline';

    @Input()
    public fullScreenButton = true;

    @Input()
    public showMatrixDetails: boolean;

    @Input()
    public url: string;

    @Output()
    public displayChange = new EventEmitter<TreeVisualizerDisplay>();

    public metadata: Metadata[] | undefined;

    // jquery tree visualizer
    private instance: any;

    constructor(private sanitizer: DomSanitizer, private downloadService: DownloadService, private xmlParseService: XmlParseService) {
    }

    ngOnInit() {
        const element = $(this.output.nativeElement);
        element.on('close', () => {
            if (this.display === 'both') {
                this.displayChange.next('inline');
            }
        });
    }

    ngOnChanges(changes: TypedChanges) {
        const element = $(this.output.nativeElement);
        if (changes.xml && changes.xml.currentValue !== changes.xml.previousValue) {
            this.visualize(element);
        }

        if (this.instance) {
            this.updateVisibility();
        }
    }

    downloadXml() {
        this.downloadService.downloadXml(
            this.filename || 'tree.xml',
            this.xml);
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

            this.xmlParseService.parse(this.xml).then((data) => {
                this.showMetadata(data);
            });
            this.updateVisibility();
        });
    }

    private updateVisibility() {
        const inline = $(this.inlineRef && this.inlineRef.nativeElement);

        if (this.display !== 'fullscreen') {
            inline.show();
        } else {
            inline.hide();
        }

        if (this.display !== 'inline') {
            this.instance.trigger('open-fullscreen');
        } else {
            this.instance.trigger('close-fullscreen');
        }
    }

    /**
     * Shows the metadata of a tree.
     * @param data The parsed XML data
     */
    private showMetadata(data: any) {
        const result: Metadata[] = [];
        if (data && data.alpino_ds && data.alpino_ds.metadata
            && data.alpino_ds.metadata[0].meta) {
            for (const item of data.alpino_ds.metadata[0].meta.sort(function (a, b) {
                return a.$.name.localeCompare(b.$.name);
            })) {
                result.push({ name: item.$.name, value: item.$.value });
            }
        }
        this.metadata = result.length ? result : undefined;
    }
}
