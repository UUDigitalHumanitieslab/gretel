
import { TextHighlightRules } from '../../common/text-highlight-rules';

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