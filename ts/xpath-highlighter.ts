import * as ace from 'brace';
import { Highlighter } from './xpath-interfaces';
let TextHighlightRules: Highlighter = ace.acequire('ace/mode/text_highlight_rules').TextHighlightRules;

const identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";
const numericRe = "[+-]?\\d[\\d_]*(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?\\b";
const equalityRe = "(=|!=|<=|<|>=|>)";

/**
 * Highlighter to use by ACE text editor for highlighting the different tokens in an XPATH string.
 */
export class XPathHighlighter extends TextHighlightRules {
    constructor() {
        super();
        this.$rules = {
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
                    regex: identifierRe,
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
                    regex: `@${identifierRe}|@`,
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
                    regex: `(\\s*)${equalityRe}(\\s*)(\"[^\"]*\")`,
                    next: "start"
                }, {
                    token: ["text", "keyword.operator", "text", "constant.numeric"],
                    regex: `(\\s*)${equalityRe}(\\s*)(${numericRe})`,
                    next: "start"
                }, {
                    defaultToken: "start"
                }
            ]
        };
    }
}
