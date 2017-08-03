import { XPathVariablesComponent } from './xpath-variables-component';

export class ComponentsRenderer {
    private componentMap = {
        '.xpath-variables': XPathVariablesComponent
    }

    public render() {
        for (let selector in this.componentMap) {
            $(selector).each((index, element) => new (this.componentMap[selector])($(element)));
        }
    }
}
