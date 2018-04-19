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
var text_highlight_rules_1 = require("./text-highlight-rules");
exports.identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";
exports.equalityRe = "(=|!=|<=|<|>=|>)";
var numericRe = "[+-]?\\d[\\d_]*(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b";
/**
 * Highlighter to use by ACE text editor for highlighting the different tokens in an XPATH string.
 */
var XPathHighlighterRules = /** @class */ (function (_super) {
    __extends(XPathHighlighterRules, _super);
    function XPathHighlighterRules() {
        var _this = _super.call(this) || this;
        _this.$rules = {
            "start": [
                {
                    token: "punctuation",
                    regex: "//",
                    next: "start"
                }, {
                    token: "operator",
                    regex: "(and|or|div|mod)",
                    next: "start"
                }, {
                    token: "keyword",
                    regex: exports.identifierRe,
                    next: "start"
                }, {
                    regex: "[\[\]]",
                    onMatch: function (val, state, stack) {
                        this.next = val == "[" ? this.nextState : "";
                        if (val == "[" && stack.length) {
                            stack.unshift("start", state);
                        }
                        else if (val == "]" && stack.length) {
                            stack.shift();
                            this.next = stack.shift();
                            return "paren.quasi.end";
                        }
                        return val == "[" ? "paren.lparen" : "paren.rparen";
                    },
                    nextState: "start"
                }, {
                    token: "support.type",
                    regex: "@" + exports.identifierRe + "|@",
                    next: "attribute"
                }, {
                    token: "string",
                    regex: '"(?=.)',
                    next: "qqstring"
                }, {
                    token: "constant.numeric",
                    regex: numericRe,
                    next: "start"
                }, {
                    defaultToken: "text",
                    next: "start"
                }
            ],
            "qqstring": [
                {
                    token: "string",
                    regex: "\\\\$",
                    next: "qqstring"
                }, {
                    token: "string",
                    regex: '"|$',
                    next: "start"
                }, {
                    defaultToken: "string"
                }
            ],
            "attribute": [
                {
                    token: ["text", "keyword.operator", "text", "attribute.string"],
                    regex: "(\\s*)" + exports.equalityRe + "(\\s*)(\"[^\"]*\"|'[^']*')",
                    next: "start"
                }, {
                    token: ["text", "keyword.operator", "text", "constant.numeric"],
                    regex: "(\\s*)" + exports.equalityRe + "(\\s*)(" + numericRe + ")",
                    next: "start"
                }, {
                    defaultToken: "start"
                }
            ]
        };
        return _this;
    }
    return XPathHighlighterRules;
}(text_highlight_rules_1.TextHighlightRules));
exports.XPathHighlighterRules = XPathHighlighterRules;
