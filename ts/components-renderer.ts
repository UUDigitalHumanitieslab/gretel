import { AnalysisComponent } from './analysis-component';
import 'lassy-xpath/jquery';

import * as $ from 'jquery';

/**
 * Renders the components which have already been placed in the HTML.
 */
export class ComponentsRenderer {
    public render() {
        $('analysis').each((index, element) => {
            new AnalysisComponent(element);
        });

        let $xpathEditor = $('.xpath-editor');
        $xpathEditor.xpathEditor({
            macrosUrl: $xpathEditor.data('macros-url')
        });

        let $xpathVariables = $('.xpath-variables');
        $xpathVariables.xpathVariables({
            formName: $xpathVariables.data('name'),
            source: $xpathVariables.data('source'),
        });
    }
}

type Component = {
    new(element: HTMLElement): void;
}
