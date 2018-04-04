import { AnalysisComponent } from './analysis-component';
import { XPathVariablesComponent } from 'lassy-xpath/jquery';

import * as $ from 'jquery';

/**
 * Renders the components which have already been placed in the HTML.
 */
export class ComponentsRenderer {
    private componentMap: { [name: string]: Component } = {
        'analysis': AnalysisComponent,
        'xpath-variables': XPathVariablesComponent
    }

    public render() {
        for (let selector in this.componentMap) {
            $(selector).each((index, element) => new (this.componentMap[selector])(element));
        }

        let $xpathEditor = $('.xpath-editor');
        $xpathEditor.xpathEditor({
            macrosUrl: $xpathEditor.data('root-url')
        });
    }
}

type Component = {
    new(element: HTMLElement): void;
}
