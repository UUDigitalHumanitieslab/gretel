import { BehaviorSubject } from 'rxjs';
import * as $ from 'jquery';
import * as ace from 'brace';
import 'brace/mode/xquery';
import 'brace/theme/dawn';
import XPathParserService from './services/xpath-parser.service';

let AceRange = ace.acequire('ace/range').Range;

export const Selector = 'xpath-editor';
export class XPathEditor {
    public autofocus: boolean;
    public value: string;

    private session: ace.IEditSession;
    private xpathParserService: XPathParserService;

    private $element: JQuery;
    private $errorElement: JQuery;
    private $hiddenInput: JQuery;

    private existingMarkerId: number | undefined = undefined;
    private valueSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private parsedObservable = this.valueSubject.debounceTime(50).map(xpath => this.xpathParserService.parse(xpath));

    constructor(element: HTMLElement) {
        this.$element = $(element);
        this.$element.data('xpath-editor', this);
        this.$hiddenInput = this.$element.children('textarea');
        this.$hiddenInput.addClass('hidden');

        this.autofocus = !!this.$element.attr('autofocus');
        this.value = this.$hiddenInput.val() as string;

        this.xpathParserService = new XPathParserService();

        this.initialize(this.$element);
    }

    private updateValue() {
        this.value = this.session.getValue();
        this.$hiddenInput.val(this.value);
        this.$hiddenInput.trigger('change');
        this.valueSubject.next(this.value);
    }

    private initialize(element: JQuery) {
        element.css({
            display: 'block',
            width: '100%'
        });
        let $container = $('<div>');
        this.$errorElement = $('<p class="errorMessage"></p>');
        this.$element.append(...[$container, this.$errorElement]);
        let editor = ace.edit($container[0]);
        editor.setValue(this.value, -1);
        if (this.autofocus) {
            editor.focus();
        }
        editor.setTheme('ace/theme/dawn');

        editor.setOptions({
            'highlightActiveLine': false,
            'showGutter': false,
            'showPrintMargin': false,
            'fontSize': 16,
            'minLines': 2,
            'maxLines': 30,
            'useWorker': false
        });

        this.session = editor.getSession();
        this.session.setMode('ace/mode/xquery');

        editor.on('change', () => this.updateValue());
        this.showErrors();
    }

    private showErrors() {
        this.parsedObservable
            .subscribe(parsed => {
                if (this.existingMarkerId != undefined) {
                    this.session.removeMarker(this.existingMarkerId);
                }

                // TODO: prevent removal if the same
                if (parsed.error) {
                    // TODO: support multi-line (and multiple) errors.
                    let pathRange: ace.Range;
                    if (parsed.error.offset == undefined) {
                        // select the entire line if the offset is unknown
                        pathRange = new AceRange(parsed.error.line, 0, parsed.error.line + 1, 0);
                    } else {
                        pathRange = new AceRange(parsed.error.line,
                            parsed.error.offset,
                            parsed.error.line,
                            parsed.error.offset + parsed.error.length);
                    }
                    this.existingMarkerId = this.session.addMarker(pathRange, 'pathError', 'text', undefined);
                    this.$errorElement.text(parsed.error.message);
                } else {
                    this.$errorElement.text('');
                }
            });
    }
}
