import * as ace from 'brace';
import { HighlighterRules } from './xpath-interfaces';
import { AlpinoFunctionHighlighterRules } from './alpino-function-highlighter-rules';
import { XPathHighlighterRules, identifierRe,equalityRe } from './xpath-highlighter-rules';
let TextHighlightRules: HighlighterRules = ace.acequire('ace/mode/text_highlight_rules').TextHighlightRules;

export class AlpinoXPathHighlighter extends TextHighlightRules {
    constructor() {
        super();
        this.$rules = new XPathHighlighterRules().getRules();

        this.embedFunction("frame");
        this.embedFunction("postag");
    }

    private embedFunction(name: string) {
        this.$rules["start"].unshift({
            token: ["support.type","text","keyword.operator","text","function.attribute.string"],
            regex: `(@${name})(\\s*)${equalityRe}(\\s*)(\")`,
            next: `${name}-start`
        });

        this.embedRules(AlpinoFunctionHighlighterRules, `${name}-`, [{
            token: "string",
            regex: "\"",
            next: "start"
        }, {
            defaultToken: "string"
        }]);
    }
}
