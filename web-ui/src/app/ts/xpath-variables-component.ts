import { PathVariable, XPathExtractinator, FormatError } from './xpath-extractinator';
import * as $ from 'jquery';
import { BehaviorSubject } from 'rxjs'
import { XPathModels } from 'ts-xpath';

export class XPathVariablesComponent {
    private view: View;
    private source: JQuery;
    private extractinator: XPathExtractinator;

    private subject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private variables = this.subject.debounceTime(50).map(xpath => this.extract(xpath)).filter(variables => variables != null);

    constructor(element: HTMLElement) {
        let $element = $(element);
        let data = $element.data();
        this.source = $(data.source);

        this.view = new View(data.name, $element);

        this.variables.subscribe(variables => {
            this.view.render(variables);
        });

        // make sure any initial value is rendered
        this.update();
        this.source.on('change keyup', evt => this.update());

        this.extractinator = new XPathExtractinator();
    }

    private update() {
        this.subject.next(this.source.val() as string);
    }

    private extract(xpath: string) {
        try {
            return this.extractinator.extract(xpath);
        }
        catch (error) {
            if (!(error instanceof XPathModels.ParseError || error instanceof FormatError)) {
                throw error;
            }
        }

        return null;
    }
}

class View {
    private renderedLength = 0;
    private names: JQuery[] = [];
    private paths: JQuery[] = [];

    private renderItem = (index: number) => {
        let nameInput = $(`<input type="hidden" name="${this.formName}[${index}][name]" />`);
        let pathInput = $(`<input type="hidden" name="${this.formName}[${index}][path]" />`);

        this.target.append(nameInput);
        this.target.append(pathInput);

        this.names.push(nameInput);
        this.paths.push(pathInput);
    }

    constructor(private formName: string, private target: JQuery) {
    }

    public render(items: PathVariable[]) {
        if (this.renderedLength != items.length) {
            this.target.empty();
            this.names = [];
            this.paths = [];

            for (let i = 0; i < items.length; i++) {
                this.renderItem(i);
            }
        }

        for (let i = 0; i < items.length; i++) {
            this.names[i].val(items[i].name)
            this.paths[i].val(items[i].path)
        }
    }
}
