
import * as ace from 'brace';
import { HighlighterRules } from './xpath-interfaces';
let TextHighlightRules: HighlighterRules = ace.acequire('ace/mode/text_highlight_rules').TextHighlightRules;

const identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";

export class AlpinoFunctionHighlighterRules extends TextHighlightRules {
    constructor() {
        super();
        this.$rules = {
            "start": [{
                token: ["function.name", "function.paren.lparen"],
                regex: `(${identifierRe})(\\()`,
                next: "function_arguments"
            }, {
                token: "function.name",
                regex: identifierRe
            }, {
                defaultToken: "function.text"
            }],
            "function_arguments": [{
                token: "function.variable.parameter",
                regex: identifierRe,
            }, {
                token: "function.punctuation.operator",
                regex: ","
            }, {
                token: "function.paren.rparen",
                regex: "\\)",
                next: "start"
            }, {
                defaultToken: "function.paren.rparen"
            }]
        };
    }
}