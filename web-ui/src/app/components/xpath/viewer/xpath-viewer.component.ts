import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange } from '@angular/core';
import { PathVariable, ExtractinatorService } from 'lassy-xpath/ng';
@Component({
    selector: 'grt-xpath-viewer',
    templateUrl: './xpath-viewer.component.html',
    styleUrls: ['./xpath-viewer.component.scss']
})
export class XPathViewerComponent implements OnChanges, OnInit {
    public lines: XPathPart[][];

    @Input()
    public value: string;
    @Input()
    public variables: { [name: string]: PathVariable };
    @Input()
    public paddingless = false;

    @Output()
    public partClick = new EventEmitter<XPathPart>();

    constructor(private extractinatorService: ExtractinatorService) {
    }

    ngOnChanges(changes: TypedChanges) {
        const isRelevantChange = (change: SimpleChange) => change && (change.firstChange || change.previousValue !== change.currentValue);
        if (isRelevantChange(changes['value']) || isRelevantChange(changes['variables'])) {
            this.determineParts();
        }
    }

    ngOnInit() {
        this.determineParts();
    }

    private determineParts() {
        if (this.value) {
            const parts = this.extractinatorService.annotate(
                this.value,
                Object.values(this.variables || {})).map(a => {
                    return {
                        classNames: a.token.type.replace('.', '-') + (a.variable ? ' path-variable' : ''),
                        content: a.token.text,
                        description: a.description,
                        variable: a.variable,
                        variableName: a.variable ? a.variable.name : null
                    };
                });
            const lines: XPathPart[][] = [[]];
            for (const part of parts) {
                const partLines = part.content.split('\n');
                let currentLine = lines[lines.length - 1];

                if (partLines.length === 1) {
                    currentLine.push(part);
                } else {
                    for (let i = 0; i < partLines.length; i++) {
                        if (i > 0) {
                            lines.push(currentLine = []);
                        }
                        currentLine.push(Object.assign({}, part, {
                            content: partLines[i] + ((i < partLines.length - 1) ? '\n' : '')
                        }));
                    }
                }
            }
            console.log(lines);
            this.lines = lines;
        } else {
            this.lines = [];
        }
    }
}

type TypedChanges = {
    [propName in keyof XPathViewerComponent]: SimpleChange;
};

export interface XPathPart {
    classNames: string;
    content: string;
    description: string | null;
    variable: PathVariable;
    variableName: string | null;
}
