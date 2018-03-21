import { AnalysisComponent } from './analysis-component';
import { XPathEditorComponent, XPathVariablesComponent } from 'lassy-xpath';

import * as $ from 'jquery';

/**
 * Renders the components which have been drawn in the HTML. Similar to how this is done in Angular 2+.
 */
export class ComponentsRenderer {
    private componentMap: { [name: string]: Component } = {
        'analysis': AnalysisComponent,
        'xpath-editor': XPathEditorComponent,
        'xpath-variables': XPathVariablesComponent
    }

    public render() {
        for (let selector in this.componentMap) {
            $(selector).each((index, element) => new (this.componentMap[selector])(element));
        }
    }
}

type Component = {
    new(element: HTMLElement): void;
}
