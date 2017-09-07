import { BehaviorSubject } from 'rxjs';
import * as $ from 'jquery';
import * as ace from 'brace';
import { modeName as xpathModeName, Completer } from './xpath-mode';
import 'brace/ext/language_tools';
import 'brace/theme/dawn';
import { MacroService } from './services/macro-service';
import XPathParserService from './services/xpath-parser.service';

let AceRange = ace.acequire('ace/range').Range;

export const Selector = 'xpath-editor';
export class XPathEditor {
    public autofocus: boolean;
    public value: string;

    private editor: ace.Editor;
    private session: ace.IEditSession;
    private macroService: MacroService;
    private xpathParserService: XPathParserService;

    private $element: JQuery;
    private $errorElement: JQuery;
    private $hiddenInput: JQuery;

    private existingErrorMarkerId: number | undefined = undefined;
    private existingWarningMarkerIds: number[] = [];
    private valueSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private macroServiceLoaded = false;

    private beforeEnrich: string = null;

    private parsedObservable = this.valueSubject.debounceTime(50).map(xpath => {
        if (this.macroServiceLoaded &&
            (xpath != this.beforeEnrich ||
                !this.session.getUndoManager().hasRedo())) {
            // don't redo enrichment if the value is the same as before the enrichment: undo was probably used
            this.beforeEnrich = xpath;
            let enrichment = this.macroService.enrich(xpath);
            if (enrichment.result) {
                for (let replacement of enrichment.replacements) {
                    let range = new AceRange(replacement.line,
                        replacement.offset,
                        replacement.line,
                        replacement.offset + replacement.length);
                    this.session.replace(range, replacement.value);
                }
                xpath = enrichment.result;
            }
        }

        return this.xpathParserService.parse(xpath);
    });

    constructor(element: HTMLElement) {
        this.$element = $(element);
        this.$element.data('xpath-editor', this);
        this.macroService = new MacroService();
        this.macroService.loadFromUrl(this.$element.data('root-url')).then(() => {
            this.macroServiceLoaded = true;
            // parse again, just to be sure
            this.valueSubject.next(this.value);
        });

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
        let languageTools = ace.acequire("ace/ext/language_tools");
        languageTools.setCompleters([new Completer()]);

        let editor = this.editor = ace.edit($container[0]);
        editor.$blockScrolling = Infinity; // disable annoying 'this will be disabled in the next version' message
        editor.setValue(this.value, -1);
        if (this.autofocus) {
            editor.focus();
        }
        editor.setTheme('ace/theme/dawn');

        editor.setOptions({
            'behavioursEnabled': true,
            'enableBasicAutocompletion': true,
            'highlightActiveLine': false,
            'showGutter': false,
            'showPrintMargin': false,
            'fontSize': 16,
            'minLines': 2,
            'maxLines': 30,
            'useWorker': false
        });

        this.session = editor.getSession();
        this.session.setMode(xpathModeName);

        editor.on('change', () => this.updateValue());
        this.showErrors();
    }

    private showErrors() {
        this.parsedObservable
            .subscribe(parsed => {
                if (parsed.error) {
                    if (this.existingErrorMarkerId != undefined) {
                        this.session.removeMarker(this.existingErrorMarkerId);
                    }

                    // TODO: prevent removal if the same
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
                    this.existingErrorMarkerId = this.session.addMarker(pathRange, 'pathError', 'text', undefined);
                    this.$errorElement.text(parsed.error.message);
                } else {
                    if (this.existingErrorMarkerId != undefined) {
                        this.session.removeMarker(this.existingErrorMarkerId);
                    }

                    // TODO: prevent removal if the same
                    this.$errorElement.text('');
                }

                // TODO: prevent removal if the same
                if (this.existingWarningMarkerIds.length) {
                    this.session.clearAnnotations();
                    this.existingWarningMarkerIds.forEach((id) => {
                        this.session.removeMarker(id);
                    });
                    this.existingWarningMarkerIds = [];
                }

                if (parsed.warnings.length) {
                    this.editor.renderer.setShowGutter(true);
                    this.existingWarningMarkerIds = parsed.warnings.map((message) => {
                        let warningRange = new AceRange(message.line,
                            message.offset,
                            message.line,
                            message.offset + message.length);
                        this.session.setAnnotations([{
                            row: message.line,
                            column: message.offset,
                            text: message.message,
                            type: 'warning'
                        }]);
                        return this.session.addMarker(warningRange, 'pathWarning', 'text', undefined);
                    })
                }
            });
    }
}