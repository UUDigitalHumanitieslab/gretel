import { AnalysisComponent } from './analysis-component';
import { XPathEditor } from './xpath-editor';
import { XPathVariablesComponent } from './xpath-variables-component';

import * as $ from 'jquery';

/**
 * Renders the components which have been drawn in the HTML. Similar to how this is done in Angular 2+.
 */
export class ComponentsRenderer {
    private componentMap: { [name: string]: Component } = {
        'analysis': AnalysisComponent,
        'xpath-editor': XPathEditor,
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
