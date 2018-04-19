"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("brace/mode/javascript");
require("brace/mode/xquery");
var ace = require("brace");
var alpino_xpath_completions_1 = require("./alpino-xpath-completions");
var xpath_attributes_1 = require("../../common/xpath-attributes");
var macro_jquery_1 = require("../../services/macro.jquery");
var alpino_xpath_highlighter_rules_1 = require("./alpino-xpath-highlighter-rules");
var TokenIterator = ace.acequire("ace/token_iterator").TokenIterator;
exports.TextMode = ace.acequire('ace/mode/text').Mode;
// defined in the javascript mode!
var MatchingBraceOutdent = ace.acequire("ace/mode/matching_brace_outdent").MatchingBraceOutdent;
var CstyleBehaviour = ace.acequire('ace/mode/behaviour/cstyle').CstyleBehaviour;
exports.XQueryBehaviour = ace.acequire('ace/mode/behaviour/xquery').XQueryBehaviour;
var TextHighlightRules = ace.acequire('ace/mode/text_highlight_rules').TextHighlightRules;
var macroService = new macro_jquery_1.MacroService();
exports.modeName = 'xpath';
var XPathMode = /** @class */ (function (_super) {
    __extends(XPathMode, _super);
    function XPathMode() {
        var _this = _super.call(this) || this;
        _this.completer = new Completer();
        _this.$behaviour = new XPathBehaviour();
        _this.HighlightRules = alpino_xpath_highlighter_rules_1.AlpinoXPathHighlighter;
        _this.$outdent = new MatchingBraceOutdent();
        return _this;
    }
    return XPathMode;
}(exports.TextMode));
exports.default = XPathMode;
// see https://github.com/thlorenz/brace/pull/98
ace.define(exports.modeName, [], { Mode: XPathMode });
var Completer = /** @class */ (function () {
    function Completer() {
        this.attributesCompletions = Object.keys(xpath_attributes_1.XpathAttributes).map(function (key) {
            return { value: key, meta: xpath_attributes_1.XpathAttributes[key].description, score: 500 };
        });
        this.allCompletions = Object.keys(alpino_xpath_completions_1.functionCompletions).map(function (func) {
            return { value: func, meta: alpino_xpath_completions_1.functionCompletions[func].meta, score: 500 };
        }).concat(alpino_xpath_completions_1.pathCompletions.concat(this.attributesCompletions.map(function (completion) {
            return {
                value: '@' + completion.value,
                meta: completion.meta,
                score: completion.score
            };
        })));
    }
    Completer.prototype.getAttributeCompletions = function (currentToken, iterator) {
        var token = currentToken;
        if (token.type && (token.type == "attribute.string" || token.type == "function.attribute.string")) {
            iterator.stepBackward();
            iterator.stepBackward();
            token = iterator.getCurrentToken();
            if (token && token.value && token.value.startsWith('@')) {
                var name_1 = token.value.substring(1);
                var attribute = xpath_attributes_1.XpathAttributes[name_1];
                var values = attribute ? attribute.values : [];
                if (values) {
                    return values.map(function (value) { return { value: value[0], meta: value[1], score: 500 }; });
                }
            }
        }
        return false;
    };
    Completer.prototype.getFunctionCompletions = function (currentToken, iterator) {
        // TODO: implement!
        return [];
    };
    Completer.prototype.getMacroCompletions = function () {
        if (Completer.onlyMacros || !Completer.onlyAttributes) {
            var macroLookup_1 = macroService.getMacros();
            return Object.keys(macroLookup_1).map(function (macro) {
                return {
                    value: "" + (!Completer.onlyMacros ? '%' : '') + macro + "%",
                    meta: macroLookup_1[macro].trim().replace(/\s\s+/g, ' '),
                    score: 500
                };
            });
        }
        return [];
    };
    Completer.prototype.getCompletions = function (editor, session, position, prefix, callback) {
        var createIterator = function () { return new TokenIterator(session, position.row, position.column); };
        var iterator = createIterator();
        var currentToken = iterator.getCurrentToken();
        var attributeCompletions = this.getAttributeCompletions(currentToken, iterator);
        if (attributeCompletions) {
            callback(null, attributeCompletions);
            return;
        }
        if (currentToken.value.startsWith("@")) {
            callback(null, this.attributesCompletions.concat([]));
            Completer.onlyAttributes = false;
        }
        else if (currentToken.type && currentToken.type.startsWith("function")) {
            callback(null, this.getFunctionCompletions(currentToken, createIterator()));
        }
        else {
            var macroCompletions = this.getMacroCompletions();
            if (Completer.onlyMacros) {
                callback(null, macroCompletions);
                Completer.onlyMacros = false;
            }
            else {
                callback(null, this.allCompletions.concat(macroCompletions));
            }
        }
    };
    // TODO: look into using ACE states for this instead
    /**
     * Only show attribute auto-completions.
     */
    Completer.onlyAttributes = false;
    /**
     * Only show macro auto-completions.
     */
    Completer.onlyMacros = false;
    return Completer;
}());
exports.Completer = Completer;
/**
 * Add additional XPATH behavior to autocomplete macros, functions and attributes.
 */
var XPathBehaviour = /** @class */ (function (_super) {
    __extends(XPathBehaviour, _super);
    function XPathBehaviour() {
        var _this = _super.call(this) || this;
        _this.inherit(CstyleBehaviour, ["brackets", "string_dquotes"]);
        _this.add("autoclosing", "insertion", function (state, action, editor, session, text) {
            if (text.endsWith('()')) {
                var func = alpino_xpath_completions_1.functionCompletions[text];
                if (func && func.hasArguments) {
                    // place the cursor within the parentheses
                    return {
                        text: text,
                        selection: [text.length - 1, text.length - 1]
                    };
                }
                return;
            }
            switch (text) {
                case "%":
                    Completer.onlyMacros = true;
                    _this.startAutocomplete(editor);
                    break;
                case "=":
                    var position = editor.getCursorPosition();
                    var iterator = new TokenIterator(session, position.row, position.column);
                    var token = iterator.getCurrentToken();
                    if (token.value.startsWith('@')) {
                        _this.startAutocomplete(editor);
                        return {
                            text: '=""',
                            selection: [2, 2]
                        };
                    }
                    break;
                case "@":
                    Completer.onlyAttributes = true;
                    _this.startAutocomplete(editor);
                    break;
            }
        });
        return _this;
    }
    XPathBehaviour.prototype.startAutocomplete = function (editor) {
        setTimeout(function () {
            editor.execCommand('startAutocomplete');
        }, 100);
    };
    return XPathBehaviour;
}(exports.XQueryBehaviour));
exports.XPathBehaviour = XPathBehaviour;
