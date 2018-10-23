import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange } from '@angular/core';
import { PathVariable, ExtractinatorService } from 'lassy-xpath/ng';
@Component({
    selector: 'grt-xpath-viewer',
    templateUrl: './xpath-viewer.component.html',
    styleUrls: ['./xpath-viewer.component.scss']
})
export class XPathViewerComponent implements OnChanges, OnInit {
    public parts: XPathPart[];

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
            this.parts = this.extractinatorService.annotate(
                this.value,
                Object.values(this.variables || {})).map(a => {
                    return {
                        classNames: a.token.type.replace('.', '-') + (a.variable ? ' path-variable' : ''),
                        content: a.token.text,
                        variable: a.variable,
                        variableName: a.variable ? a.variable.name : null
                    };
                });
        } else {
            this.parts = [];
        }
    }
}

type TypedChanges = {
    [propName in keyof XPathViewerComponent]: SimpleChange;
};

export interface XPathPart {
    classNames: string;
    content: string;
    variable: PathVariable;
    variableName: string | null;
}
