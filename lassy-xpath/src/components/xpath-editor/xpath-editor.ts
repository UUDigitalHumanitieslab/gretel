import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilKeyChanged';

import * as ace from 'brace';
import { modeName as xpathModeName, Completer } from './xpath-mode';
import 'brace/ext/language_tools';
import 'brace/theme/dawn';
import { Macro } from '../../services/macro';
import { ParseMessage, LassyXPathParser } from '../../services/lassy-xpath-parser';

let AceRange = ace.acequire('ace/range').Range;

export const Selector = 'xpath-editor';
export class XPathEditor {
    private editor: ace.Editor;
    private session: ace.IEditSession;

    private existingErrorMarkerId: number | undefined = undefined;
    private existingWarningMarkerIds: number[] = [];
    private valueSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private errorMessageSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
    private macroServiceLoaded = false;

    private beforeEnrich: string = null;

    public valueObservable = this.valueSubject.asObservable();
    public errorMessageObservable = this.errorMessageSubject.asObservable();

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

    constructor(private xpathParserService: LassyXPathParser, private macroService: Macro) {
        this.macroService.onceLoaded.then(() => {
            this.macroServiceLoaded = true;
            // parse again, just to be sure
            this.valueSubject.next(this.valueSubject.value);
        });
    }

    private updateValue() {
        this.valueSubject.next(this.session.getValue());
    }

    public initialize(container: HTMLElement, autofocus: boolean, value: string) {
        let languageTools = ace.acequire("ace/ext/language_tools");
        languageTools.setCompleters([new Completer()]);

        this.valueSubject.next(value);

        let editor = this.editor = ace.edit(container);
        editor.$blockScrolling = Infinity; // disable annoying 'this will be disabled in the next version' message
        editor.setValue(value, -1);
        if (autofocus) {
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

    /**
     * Listen for parse errors and warnings and show them.
     */
    private showErrors() {
        this.parsedObservable
            .map(parsed => {
                return {
                    value: parsed,
                    key: (parsed.error ? parsed.error.startLine + parsed.error.message : '')
                        + (parsed.warnings ? parsed.warnings.map(w => w.startLine + w.message).join('') : '')
                }
            })
            .distinctUntilKeyChanged('key')
            .subscribe(parsed => {
                if (parsed.value.error) {
                    this.showErrorMessage(parsed.value.error);
                } else {
                    this.hideErrorMessage();
                }

                this.hideWarningMessages();

                if (parsed.value.warnings.length) {
                    // warning markers are rendered in the gutter
                    this.editor.renderer.setShowGutter(true);
                    this.showWarningMessages(parsed.value.warnings);
                }
            });
    }

    private hideErrorMessage() {
        if (this.existingErrorMarkerId != undefined) {
            this.session.removeMarker(this.existingErrorMarkerId);
            this.errorMessageSubject.next('');
        }
    }

    private hideWarningMessages() {
        if (this.existingWarningMarkerIds.length) {
            this.session.clearAnnotations();
            this.existingWarningMarkerIds.forEach((id) => {
                this.session.removeMarker(id);
            });
            this.existingWarningMarkerIds = [];
        }
    }

    private showErrorMessage(errorMessage: ParseMessage) {
        this.hideErrorMessage();

        let pathRange: ace.Range;
        if (errorMessage.startColumn == undefined) {
            // select the entire line if the offset is unknown
            pathRange = new AceRange(errorMessage.startLine, 0, errorMessage.startLine + 1, 0);
        } else {
            pathRange = new AceRange(errorMessage.startLine,
                errorMessage.startColumn,
                errorMessage.lastColumn,
                errorMessage.lastColumn);
        }

        this.existingErrorMarkerId = this.session.addMarker(pathRange, 'pathError', 'text', undefined);
        this.errorMessageSubject.next(errorMessage.message);
    }

    private showWarningMessages(warningMessages: ParseMessage[]) {
        this.existingWarningMarkerIds = warningMessages.map((message) => {
            let warningRange = new AceRange(message.startLine,
                message.startColumn,
                message.lastLine,
                message.lastColumn);
            this.session.setAnnotations([{
                row: message.startLine,
                column: message.startColumn,
                text: message.message,
                type: 'warning'
            }]);
            return this.session.addMarker(warningRange, 'pathWarning', 'text', undefined);
        });
    }
}
