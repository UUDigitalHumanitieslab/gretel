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
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var XPathModels;
    (function (XPathModels) {
        function debugLog() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            console.debug(args.join(', '));
        }
        XPathModels.debugLog = debugLog;
        function validateAxisName(name) {
            return name in XPathAxisEnum;
        }
        XPathModels.validateAxisName = validateAxisName;
        var XPathInitialContextEnum;
        (function (XPathInitialContextEnum) {
            XPathInitialContextEnum["HASHTAG"] = "hashtag";
            XPathInitialContextEnum["ROOT"] = "abs";
            XPathInitialContextEnum["RELATIVE"] = "rel";
            XPathInitialContextEnum["EXPR"] = "expr";
        })(XPathInitialContextEnum = XPathModels.XPathInitialContextEnum || (XPathModels.XPathInitialContextEnum = {}));
        ;
        var XPathAxisEnum;
        (function (XPathAxisEnum) {
            XPathAxisEnum["CHILD"] = "child";
            XPathAxisEnum["DESCENDANT"] = "descendant";
            XPathAxisEnum["PARENT"] = "parent";
            XPathAxisEnum["ANCESTOR"] = "ancestor";
            XPathAxisEnum["FOLLOWING_SIBLING"] = "following-sibling";
            XPathAxisEnum["PRECEDING_SIBLING"] = "preceding-sibling";
            XPathAxisEnum["FOLLOWING"] = "following";
            XPathAxisEnum["PRECEDING"] = "preceding";
            XPathAxisEnum["ATTRIBUTE"] = "attribute";
            XPathAxisEnum["NAMESPACE"] = "namespace";
            XPathAxisEnum["SELF"] = "self";
            XPathAxisEnum["DESCENDANT_OR_SELF"] = "descendant-or-self";
            XPathAxisEnum["ANCESTOR_OR_SELF"] = "ancestor-or-self";
        })(XPathAxisEnum = XPathModels.XPathAxisEnum || (XPathModels.XPathAxisEnum = {}));
        ;
        var XPathTestEnum;
        (function (XPathTestEnum) {
            XPathTestEnum["NAME"] = "name";
            XPathTestEnum["NAME_WILDCARD"] = "*";
            XPathTestEnum["NAMESPACE_WILDCARD"] = ":*";
            XPathTestEnum["TYPE_NODE"] = "node()";
            XPathTestEnum["TYPE_TEXT"] = "text()";
            XPathTestEnum["TYPE_COMMENT"] = "comment()";
            XPathTestEnum["TYPE_PROCESSING_INSTRUCTION"] = "processing-instruction";
        })(XPathTestEnum = XPathModels.XPathTestEnum || (XPathModels.XPathTestEnum = {}));
        var XPathVariableReference = (function () {
            function XPathVariableReference(value) {
                this.value = value;
            }
            return XPathVariableReference;
        }());
        XPathModels.XPathVariableReference = XPathVariableReference;
        var XPathOperationBase = (function () {
            function XPathOperationBase() {
            }
            return XPathOperationBase;
        }());
        var XPathOperator = (function (_super) {
            __extends(XPathOperator, _super);
            function XPathOperator(properties) {
                var _this = _super.call(this) || this;
                _this.properties = properties;
                _this.operationType = properties.type;
                return _this;
            }
            return XPathOperator;
        }(XPathOperationBase));
        var XPathBoolExpr = (function (_super) {
            __extends(XPathBoolExpr, _super);
            function XPathBoolExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return XPathBoolExpr;
        }(XPathOperator));
        XPathModels.XPathBoolExpr = XPathBoolExpr;
        var XPathEqExpr = (function (_super) {
            __extends(XPathEqExpr, _super);
            function XPathEqExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return XPathEqExpr;
        }(XPathOperator));
        XPathModels.XPathEqExpr = XPathEqExpr;
        var XPathCmpExpr = (function (_super) {
            __extends(XPathCmpExpr, _super);
            function XPathCmpExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return XPathCmpExpr;
        }(XPathOperator));
        XPathModels.XPathCmpExpr = XPathCmpExpr;
        var XPathArithExpr = (function (_super) {
            __extends(XPathArithExpr, _super);
            function XPathArithExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return XPathArithExpr;
        }(XPathOperator));
        XPathModels.XPathArithExpr = XPathArithExpr;
        var XPathUnionExpr = (function (_super) {
            __extends(XPathUnionExpr, _super);
            function XPathUnionExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return XPathUnionExpr;
        }(XPathOperator));
        XPathModels.XPathUnionExpr = XPathUnionExpr;
        var XPathNumNegExpr = (function (_super) {
            __extends(XPathNumNegExpr, _super);
            function XPathNumNegExpr(properties) {
                var _this = _super.call(this) || this;
                _this.properties = properties;
                _this.operationType = properties.type;
                return _this;
            }
            return XPathNumNegExpr;
        }(XPathOperationBase));
        XPathModels.XPathNumNegExpr = XPathNumNegExpr;
        var XPathFuncExpr = (function (_super) {
            __extends(XPathFuncExpr, _super);
            function XPathFuncExpr(properties) {
                var _this = _super.call(this) || this;
                _this.properties = properties;
                _this.type = 'function';
                return _this;
            }
            return XPathFuncExpr;
        }(XPathExpression));
        XPathModels.XPathFuncExpr = XPathFuncExpr;
        var XPathPathExpr = (function () {
            function XPathPathExpr(properties) {
                this.properties = properties;
                this.type = 'path';
            }
            return XPathPathExpr;
        }());
        XPathModels.XPathPathExpr = XPathPathExpr;
        var XPathStep = (function () {
            function XPathStep(properties) {
                this.properties = properties;
                this.type = 'path-step';
            }
            return XPathStep;
        }());
        XPathModels.XPathStep = XPathStep;
        var XPathFilterExpr = (function () {
            function XPathFilterExpr(properties) {
                this.properties = properties;
                this.type = 'filter';
            }
            return XPathFilterExpr;
        }());
        XPathModels.XPathFilterExpr = XPathFilterExpr;
        var XPathStringLiteral = (function () {
            function XPathStringLiteral(value) {
                this.value = value;
                this.type = 'string';
            }
            return XPathStringLiteral;
        }());
        XPathModels.XPathStringLiteral = XPathStringLiteral;
        var XPathNumericLiteral = (function () {
            function XPathNumericLiteral(value) {
                this.value = value;
                this.type = 'numeric';
            }
            return XPathNumericLiteral;
        }());
        XPathModels.XPathNumericLiteral = XPathNumericLiteral;
    })(XPathModels = exports.XPathModels || (exports.XPathModels = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtbW9kZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vdHMveHBhdGgtbW9kZWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFjLFdBQVcsQ0FzSXhCO0lBdElELFdBQWMsV0FBVztRQUNyQjtZQUF5QixjQUFpQjtpQkFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO2dCQUFqQix5QkFBaUI7O1lBQ3RDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFGZSxvQkFBUSxXQUV2QixDQUFBO1FBRUQsMEJBQWlDLElBQVk7WUFDekMsTUFBTSxDQUFDLElBQUksSUFBSSxhQUFhLENBQUM7UUFDakMsQ0FBQztRQUZlLDRCQUFnQixtQkFFL0IsQ0FBQTtRQUVELElBQVksdUJBS1g7UUFMRCxXQUFZLHVCQUF1QjtZQUMvQiw4Q0FBbUIsQ0FBQTtZQUNuQix1Q0FBWSxDQUFBO1lBQ1osMkNBQWdCLENBQUE7WUFDaEIsd0NBQWEsQ0FBQTtRQUNqQixDQUFDLEVBTFcsdUJBQXVCLEdBQXZCLG1DQUF1QixLQUF2QixtQ0FBdUIsUUFLbEM7UUFBQSxDQUFDO1FBRUYsSUFBWSxhQWNYO1FBZEQsV0FBWSxhQUFhO1lBQ3JCLGdDQUFlLENBQUE7WUFDZiwwQ0FBeUIsQ0FBQTtZQUN6QixrQ0FBaUIsQ0FBQTtZQUNqQixzQ0FBcUIsQ0FBQTtZQUNyQix3REFBdUMsQ0FBQTtZQUN2Qyx3REFBdUMsQ0FBQTtZQUN2Qyx3Q0FBdUIsQ0FBQTtZQUN2Qix3Q0FBdUIsQ0FBQTtZQUN2Qix3Q0FBdUIsQ0FBQTtZQUN2Qix3Q0FBdUIsQ0FBQTtZQUN2Qiw4QkFBYSxDQUFBO1lBQ2IsMERBQXlDLENBQUE7WUFDekMsc0RBQXFDLENBQUE7UUFDekMsQ0FBQyxFQWRXLGFBQWEsR0FBYix5QkFBYSxLQUFiLHlCQUFhLFFBY3hCO1FB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