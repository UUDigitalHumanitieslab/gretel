///<reference path="definitions/ace.d.ts"/>
import * as ace from 'ace/ace';
export const Selector = 'xpath-editor';
export class XPathEditor {
    public autofocus: boolean;
    public value: string;

    private session: AceAjax.IEditSession;

    private $element: JQuery;
    private $hiddenInput: JQuery;

    constructor(element: HTMLElement) {
        this.$element = $(element);
        this.$element.data('xpath-editor', this);
        this.$hiddenInput = this.$element.children('textarea');
        this.$hiddenInput.addClass('hidden');

        this.autofocus = !!this.$element.attr('autofocus');
        this.value = this.$hiddenInput.val() as string;

        this.initialize(this.$element);
    }

    private updateValue() {
        this.value = this.session.getValue();
        this.$hiddenInput.val(this.value);
        this.$hiddenInput.trigger('change');
    }

    private initialize(element: JQuery) {
        element.css({
            display: 'block',
            width: '100%'
        });
        let $container = $('<div>');
        this.$element.append($container);
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

        this.session = editor.getSession();
        this.session.setMode('ace/mode/xquery');

        editor.on('change', () => this.updateValue());
    }
}
