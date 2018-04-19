import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/distinctUntilKeyChanged';
import 'brace/ext/language_tools';
import 'brace/theme/dawn';
import { Macro } from '../../services/macro';
import { LassyXPathParser } from '../../services/lassy-xpath-parser';
export declare const Selector = "xpath-editor";
export declare class XPathEditor {
    private xpathParserService;
    private macroService;
    private editor;
    private session;
    private existingErrorMarkerId;
    private existingWarningMarkerIds;
    private valueSubject;
    private errorMessageSubject;
    private macroServiceLoaded;
    private beforeEnrich;
    valueObservable: Observable<string>;
    errorMessageObservable: Observable<string>;
    private parsedObservable;
    constructor(xpathParserService: LassyXPathParser, macroService: Macro);
    private updateValue();
    initialize(container: HTMLElement, autofocus: boolean, value: string): void;
    /**
     * Listen for parse errors and warnings and show them.
     */
    private showErrors();
    private hideErrorMessage();
    private hideWarningMessages();
    private showErrorMessage(errorMessage);
    private showWarningMessages(warningMessages);
}
