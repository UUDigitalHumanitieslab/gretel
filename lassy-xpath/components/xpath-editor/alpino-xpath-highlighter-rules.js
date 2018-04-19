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
var text_highlight_rules_1 = require("../../common/text-highlight-rules");
var alpino_function_highlighter_rules_1 = require("./alpino-function-highlighter-rules");
var xpath_highlighter_rules_1 = require("../../common/xpath-highlighter-rules");
var AlpinoXPathHighlighter = /** @class */ (function (_super) {
    __extends(AlpinoXPathHighlighter, _super);
    function AlpinoXPathHighlighter() {
        var _this = _super.call(this) || this;
        _this.$rules = new xpath_highlighter_rules_1.XPathHighlighterRules().getRules();
        _this.embedFunction("frame");
        _this.embedFunction("postag");
        return _this;
    }
    AlpinoXPathHighlighter.prototype.embedFunction = function (name) {
        this.$rules["start"].unshift({
            token: ["support.type", "text", "keyword.operator", "text", "function.attribute.string"],
            regex: "(@" + name + ")(\\s*)" + xpath_highlighter_rules_1.equalityRe + "(\\s*)(\")",
            next: name + "-start"
        });
        this.embedRules(alpino_function_highlighter_rules_1.AlpinoFunctionHighlighterRules, name + "-", [{
                token: "string",
                regex: "\"",
                next: "start"
            }, {
                defaultToken: "string"
            }]);
    };
    return AlpinoXPathHighlighter;
}(text_highlight_rules_1.TextHighlightRules));
exports.AlpinoXPathHighlighter = AlpinoXPathHighlighter;
