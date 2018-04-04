import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { XPathEditor } from './xpath-editor';
import { MacroService, LassyXPathParser } from '../../services/_jquery';

class JQueryXPathEditor extends XPathEditor {
    private $wrapper: JQuery;
    private $errorElement: JQuery;
    private subscriptions: Subscription[];

    constructor(textarea: HTMLElement, macrosUrl: string) {
        let macroService = new MacroService();
        macroService.loadFromUrl(macrosUrl);

        super(new LassyXPathParser(), macroService);
        this.render(textarea);
    }

    private render(textArea: HTMLElement) {
        let $textArea = $(textArea);
        this.$wrapper = $textArea.wrap('<div class="xpath-editor-wrapper" />').parent();
        this.$wrapper.css({
            display: 'block',
            width: '100%'
        });

        let $editorContainer = $('<div>');
        this.$errorElement = $('<p class="errorMessage"></p>');

        this.$wrapper.append(...[$editorContainer, this.$errorElement]);

        // the actual textarea will be hidden
        $textArea.hide();

        let autofocus = !!$textArea.attr('autofocus');
        let value = $textArea.val() as string;

        $textArea.on('remove', () => {
            for (let subscription of this.subscriptions) {
                subscription.unsubscribe();
            }
            this.subscriptions = [];
        });

        this.subscriptions = [
            this.errorMessage.subscribe((message) => {
                this.$errorElement.text(message);
            }),
            this.value.subscribe((value) => {
                $textArea.val(value);
                $textArea.trigger('change');
            })
        ];

        this.initialize($editorContainer[0], autofocus, value);
    }
}

let xpathEditor: CreateJQueryXPathEditor = function (options) {
    return this.each(function () {
        let textArea = this;
        $(this).data('xpath-editor', new JQueryXPathEditor(textArea, options.macrosUrl));
    });
}

$.fn.extend({ xpathEditor });
export type CreateJQueryXPathEditor = (options: { macrosUrl: string }) => JQuery;
declare global {
    interface JQuery {
        xpathEditor: CreateJQueryXPathEditor
    }
}
