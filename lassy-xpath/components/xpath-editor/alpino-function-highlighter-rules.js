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
var identifierRe = "[a-zA-Z\\$_\u00a1-\uffff][a-zA-Z\\d\\$_\u00a1-\uffff]*";
var AlpinoFunctionHighlighterRules = /** @class */ (function (_super) {
    __extends(AlpinoFunctionHighlighterRules, _super);
    function AlpinoFunctionHighlighterRules() {
        var _this = _super.call(this) || this;
        _this.$rules = {
            "start": [{
                    token: ["function.name", "function.paren.lparen"],
                    regex: "(" + identifierRe + ")(\\()",
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
        return _this;
    }
    return AlpinoFunctionHighlighterRules;
}(text_highlight_rules_1.TextHighlightRules));
exports.AlpinoFunctionHighlighterRules = AlpinoFunctionHighlighterRules;
