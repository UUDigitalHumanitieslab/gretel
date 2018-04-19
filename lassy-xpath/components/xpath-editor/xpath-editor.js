"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BehaviorSubject_1 = require("rxjs/BehaviorSubject");
require("rxjs/add/operator/debounceTime");
require("rxjs/add/operator/map");
require("rxjs/add/operator/distinctUntilKeyChanged");
var ace = require("brace");
var xpath_mode_1 = require("./xpath-mode");
require("brace/ext/language_tools");
require("brace/theme/dawn");
var AceRange = ace.acequire('ace/range').Range;
exports.Selector = 'xpath-editor';
var XPathEditor = /** @class */ (function () {
    function XPathEditor(xpathParserService, macroService) {
        var _this = this;
        this.xpathParserService = xpathParserService;
        this.macroService = macroService;
        this.existingErrorMarkerId = undefined;
        this.existingWarningMarkerIds = [];
        this.valueSubject = new BehaviorSubject_1.BehaviorSubject('');
        this.errorMessageSubject = new BehaviorSubject_1.BehaviorSubject('');
        this.macroServiceLoaded = false;
        this.beforeEnrich = null;
        this.valueObservable = this.valueSubject.asObservable();
        this.errorMessageObservable = this.errorMessageSubject.asObservable();
        this.parsedObservable = this.valueSubject.debounceTime(50).map(function (xpath) {
            if (_this.macroServiceLoaded &&
                (xpath != _this.beforeEnrich ||
                    !_this.session.getUndoManager().hasRedo())) {
                // don't redo enrichment if the value is the same as before the enrichment: undo was probably used
                _this.beforeEnrich = xpath;
                var enrichment = _this.macroService.enrich(xpath);
                if (enrichment.result) {
                    for (var _i = 0, _a = enrichment.replacements; _i < _a.length; _i++) {
                        var replacement = _a[_i];
                        var range = new AceRange(replacement.line, replacement.offset, replacement.line, replacement.offset + replacement.length);
                        _this.session.replace(range, replacement.value);
                    }
                    xpath = enrichment.result;
                }
            }
            return _this.xpathParserService.parse(xpath);
        });
        this.macroService.onceLoaded.then(function () {
            _this.macroServiceLoaded = true;
            // parse again, just to be sure
            _this.valueSubject.next(_this.valueSubject.value);
        });
    }
    XPathEditor.prototype.updateValue = function () {
        this.valueSubject.next(this.session.getValue());
    };
    XPathEditor.prototype.initialize = function (container, autofocus, value) {
        var _this = this;
        var languageTools = ace.acequire("ace/ext/language_tools");
        languageTools.setCompleters([new xpath_mode_1.Completer()]);
        this.valueSubject.next(value);
        var editor = this.editor = ace.edit(container);
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
        this.session.setMode(xpath_mode_1.modeName);
        editor.on('change', function () { return _this.updateValue(); });
        this.showErrors();
    };
    /**
     * Listen for parse errors and warnings and show them.
     */
    XPathEditor.prototype.showErrors = function () {
        var _this = this;
        this.parsedObservable
            .map(function (parsed) {
            return {
                value: parsed,
                key: (parsed.error ? parsed.error.startLine + parsed.error.message : '')
                    + (parsed.warnings ? parsed.warnings.map(function (w) { return w.startLine + w.message; }).join('') : '')
            };
        })
            .distinctUntilKeyChanged('key')
            .subscribe(function (parsed) {
            if (parsed.value.error) {
                _this.showErrorMessage(parsed.value.error);
            }
            else {
                _this.hideErrorMessage();
            }
            _this.hideWarningMessages();
            if (parsed.value.warnings.length) {
                // warning markers are rendered in the gutter
                _this.editor.renderer.setShowGutter(true);
                _this.showWarningMessages(parsed.value.warnings);
            }
        });
    };
    XPathEditor.prototype.hideErrorMessage = function () {
        if (this.existingErrorMarkerId != undefined) {
            this.session.removeMarker(this.existingErrorMarkerId);
            this.errorMessageSubject.next('');
        }
    };
    XPathEditor.prototype.hideWarningMessages = function () {
        var _this = this;
        if (this.existingWarningMarkerIds.length) {
            this.session.clearAnnotations();
            this.existingWarningMarkerIds.forEach(function (id) {
                _this.session.removeMarker(id);
            });
            this.existingWarningMarkerIds = [];
        }
    };
    XPathEditor.prototype.showErrorMessage = function (errorMessage) {
        this.hideErrorMessage();
        var pathRange;
        if (errorMessage.startColumn == undefined) {
            // select the entire line if the offset is unknown
            pathRange = new AceRange(errorMessage.startLine, 0, errorMessage.startLine + 1, 0);
        }
        else {
            pathRange = new AceRange(errorMessage.startLine, errorMessage.startColumn, errorMessage.lastColumn, errorMessage.lastColumn);
        }
        this.existingErrorMarkerId = this.session.addMarker(pathRange, 'pathError', 'text', undefined);
        this.errorMessageSubject.next(errorMessage.message);
    };
    XPathEditor.prototype.showWarningMessages = function (warningMessages) {
        var _this = this;
        this.existingWarningMarkerIds = warningMessages.map(function (message) {
            var warningRange = new AceRange(message.startLine, message.startColumn, message.lastLine, message.lastColumn);
            _this.session.setAnnotations([{
                    row: message.startLine,
                    column: message.startColumn,
                    text: message.message,
                    type: 'warning'
                }]);
            return _this.session.addMarker(warningRange, 'pathWarning', 'text', undefined);
        });
    };
    return XPathEditor;
}());
exports.XPathEditor = XPathEditor;
