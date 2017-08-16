///<reference path="definitions/ace.d.ts"/>
import { BehaviorSubject } from 'rxjs';
import * as ace from 'ace/ace';
import XPathParserService from './services/xpath-parser.service';

export const Selector = 'xpath-editor';
export class XPathEditor {
    public autofocus: boolean;
    public value: string;

    private session: AceAjax.IEditSession;
    private xpathParserService: XPathParserService;

    private $element: JQuery;
    private $errorElement: JQuery;
    private $hiddenInput: JQuery;

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

        editor.setOption('highlightActiveLine', false);
        editor.setOption('showGutter', false);
        editor.setOption('showPrintMargin', false);
        editor.setOption('fontSize', 16);
        editor.setOption('minLines', 2);
        editor.setOption('maxLines', 30);
        editor.setOption('useWorker', false);

        this.session = editor.getSession();
        this.session.setMode('ace/mode/xquery');

        editor.on('change', () => this.updateValue());
        this.showErrors();
    }

    private showErrors() {
        this.parsedObservable
            .subscribe(parsed => {
                $('.pathError').removeClass('pathError');
                if (parsed.error) {
                    let $line = $(`.ace_text-layer .ace_line:nth(${parsed.error.line})`);
                    if (parsed.error.offset != undefined && parsed.error.length != undefined) {
                        let position = 0;
                        $line.children().each((index, child) => {
                            let length = child.innerText.length;
                            if (parsed.error.offset >= position && parsed.error.length <= position + length) {
                                $(child).addClass('pathError');
                            }
                            position += length;
                        });
                    } else {
                        $line.addClass('pathError');
                    }
                    this.$errorElement.text(parsed.error.message);
                } else {
                    this.$errorElement.text('');
                }
            });
    }
}
