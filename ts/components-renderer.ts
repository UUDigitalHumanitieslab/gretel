import { AnalysisComponent } from './analysis-component';
import { XPathVariablesComponent } from './xpath-variables-component';

import * as $ from 'jquery';

export class ComponentsRenderer {
    private componentMap = {
        'analysis': AnalysisComponent,
        'xpath-variables': XPathVariablesComponent
    }

    public render() {
        for (let selector in this.componentMap) {
            $(selector).each((index, element) => new (this.componentMap[selector])($(element)));
        }
    }
}
