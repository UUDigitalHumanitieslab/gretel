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
    Object.defineProperty(exports, "__esModule", { value: true });
    var XPathModels;
    (function (XPathModels) {
        XPathModels.isDebugging = false;
        function debugLog() {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (XPathModels.isDebugging) {
                console.debug(args.join(', '));
            }
        }
        XPathModels.debugLog = debugLog;
        function validateAxisName(name) {
            return name in XPathAxisEnum;
        }
        XPathModels.validateAxisName = validateAxisName;
        var ParseError = (function () {
            function ParseError(message, hash) {
                this.message = message;
                this.hash = hash;
            }
            return ParseError;
        }());
        XPathModels.ParseError = ParseError;
        function parseError(str, hash) {
            throw new ParseError(str, hash);
        }
        XPathModels.parseError = parseError;
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
            XPathVariableReference.prototype.toXPath = function () {
                return "" + this.value;
            };
            ;
            return XPathVariableReference;
        }());
        XPathModels.XPathVariableReference = XPathVariableReference;
        var XPathOperationBase = (function () {
            function XPathOperationBase() {
                this.type = 'operation';
            }
            return XPathOperationBase;
        }());
        var XPathOperator = (function (_super) {
            __extends(XPathOperator, _super);
            function XPathOperator(properties) {
                var _this = _super.call(this) || this;
                _this.properties = properties;
                _this.parens = false;
                _this.operationType = properties.type;
                return _this;
            }
            XPathOperator.prototype.getChildren = function () {
                return [this.properties.left, this.properties.right];
            };
            XPathOperator.prototype.toXPath = function () {
                var ret = this.properties.left.toXPath() + " " + this.expressionTypeEnumToXPathLiteral(this.operationType) + " " + this.properties.right.toXPath();
                if (this.parens === true) {
                    return "(" + ret + ")";
                }
                return ret;
            };
            return XPathOperator;
        }(XPathOperationBase));
        var XPathBoolExpr = (function (_super) {
            __extends(XPathBoolExpr, _super);
            function XPathBoolExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            XPathBoolExpr.prototype.expressionTypeEnumToXPathLiteral = function (type) {
                return type;
            };
            return XPathBoolExpr;
        }(XPathOperator));
        XPathModels.XPathBoolExpr = XPathBoolExpr;
        var XPathEqExpr = (function (_super) {
            __extends(XPathEqExpr, _super);
            function XPathEqExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            XPathEqExpr.prototype.expressionTypeEnumToXPathLiteral = function (type) {
                return type == '==' ? '=' : '!=';
            };
            return XPathEqExpr;
        }(XPathOperator));
        XPathModels.XPathEqExpr = XPathEqExpr;
        var XPathCmpExpr = (function (_super) {
            __extends(XPathCmpExpr, _super);
            function XPathCmpExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            XPathCmpExpr.prototype.expressionTypeEnumToXPathLiteral = function (type) {
                return type;
            };
            return XPathCmpExpr;
        }(XPathOperator));
        XPathModels.XPathCmpExpr = XPathCmpExpr;
        var XPathArithExpr = (function (_super) {
            __extends(XPathArithExpr, _super);
            function XPathArithExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            XPathArithExpr.prototype.expressionTypeEnumToXPathLiteral = function (type) {
                switch (type) {
                    case '%':
                        return 'mod';
                    case '/':
                        return 'div';
                    default:
                        return type;
                }
            };
            return XPathArithExpr;
        }(XPathOperator));
        XPathModels.XPathArithExpr = XPathArithExpr;
        var XPathUnionExpr = (function (_super) {
            __extends(XPathUnionExpr, _super);
            function XPathUnionExpr() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            XPathUnionExpr.prototype.expressionTypeEnumToXPathLiteral = function (type) {
                return '|';
            };
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
            XPathNumNegExpr.prototype.toXPath = function () {
                return "-" + this.properties.value;
            };
            return XPathNumNegExpr;
        }(XPathOperationBase));
        XPathModels.XPathNumNegExpr = XPathNumNegExpr;
        var XPathFuncExpr = (function () {
            function XPathFuncExpr(properties) {
                this.properties = properties;
                this.type = 'function';
                this.args = properties.args || [];
            }
            XPathFuncExpr.prototype.getChildren = function () {
                return this.args;
            };
            XPathFuncExpr.prototype.toXPath = function () {
                return this.properties.id + "(" + this.args.map(function (arg) { return arg.toXPath(); }).join(", ") + ")";
            };
            return XPathFuncExpr;
        }());
        XPathModels.XPathFuncExpr = XPathFuncExpr;
        var XPathPathExpr = (function () {
            function XPathPathExpr(properties) {
                this.properties = properties;
                this.type = 'path';
                this.steps = properties.steps || [];
            }
            XPathPathExpr.prototype.getChildren = function () {
                return this.steps;
            };
            XPathPathExpr.prototype.toXPath = function () {
                var parts = this.steps.map(function (step) { return step.toXPath(); }), ret = [], curPart, prevPart = '', sep;
                var root = (this.properties.initialContext === XPathInitialContextEnum.ROOT) ? "/" : "";
                if (this.properties.filter) {
                    parts.splice(0, 0, this.properties.filter.toXPath());
                }
                if (parts.length === 0) {
                    return root;
                }
                for (var i = 0; i < parts.length; i++) {
                    curPart = parts[i];
                    if (curPart !== "//" && prevPart !== "//") {
                        sep = (i === 0) ? root : "/";
                        ret.push(sep);
                    }
                    ret.push(curPart);
                    prevPart = curPart;
                }
                return ret.join("");
            };
            return XPathPathExpr;
        }());
        XPathModels.XPathPathExpr = XPathPathExpr;
        var XPathStep = (function () {
            function XPathStep(properties) {
                this.properties = properties;
                this.type = 'path-step';
                this.predicates = properties.predicates || [];
            }
            XPathStep.prototype.getChildren = function () {
                return this.predicates;
            };
            XPathStep.prototype.testString = function () {
                switch (this.properties.test) {
                    case XPathTestEnum.NAME:
                        return String(this.properties.name);
                    case XPathTestEnum.TYPE_PROCESSING_INSTRUCTION:
                        return "processing-instruction(" + (this.properties.literal || "") + ")";
                    case XPathTestEnum.NAMESPACE_WILDCARD:
                        return this.properties.namespace + ":*";
                    default:
                        return this.properties.test || null;
                }
            };
            ;
            XPathStep.prototype.mainXPath = function () {
                var axisPrefix = this.properties.axis + "::";
                switch (this.properties.axis) {
                    case XPathAxisEnum.DESCENDANT_OR_SELF:
                        if (this.properties.test === XPathTestEnum.TYPE_NODE) {
                            return "//";
                        }
                        break;
                    case XPathAxisEnum.CHILD:
                        axisPrefix = "";
                        break;
                    case XPathAxisEnum.ATTRIBUTE:
                        axisPrefix = "@";
                        break;
                    case XPathAxisEnum.SELF:
                        if (this.properties.test === XPathTestEnum.TYPE_NODE) {
                            return ".";
                        }
                        break;
                    case XPathAxisEnum.PARENT:
                        if (this.properties.test === XPathTestEnum.TYPE_NODE) {
                            return "..";
                        }
                        break;
                    default:
                        break;
                }
                return axisPrefix + this.testString();
            };
            ;
            XPathStep.prototype.predicateXPath = function () {
                if (this.predicates.length > 0) {
                    return "[" + this.predicates.map(function (p) { return p.toXPath(); }).join("][") + "]";
                }
                return "";
            };
            ;
            XPathStep.prototype.toXPath = function () {
                return this.mainXPath() + this.predicateXPath();
            };
            return XPathStep;
        }());
        XPathModels.XPathStep = XPathStep;
        var XPathFilterExpr = (function () {
            function XPathFilterExpr(properties) {
                this.properties = properties;
                this.type = 'filter';
                this.predicates = properties.predicates || [];
            }
            XPathFilterExpr.prototype.getChildren = function () {
                return this.predicates;
            };
            XPathFilterExpr.prototype.toXPath = function () {
                var predicates = "";
                if (this.predicates.length > 0) {
                    predicates = "[" + this.predicates.map(function (p) { return p.toXPath(); }).join("][") + "]";
                }
                var expr = this.properties.expr.toXPath();
                if (!(this.properties.expr instanceof XPathFuncExpr)) {
                    expr = "(" + expr + ")";
                }
                return expr + predicates;
            };
            return XPathFilterExpr;
        }());
        XPathModels.XPathFilterExpr = XPathFilterExpr;
        var XPathStringLiteral = (function () {
            function XPathStringLiteral(value) {
                this.type = 'string';
                this.stringDelimiter = value[0];
                this.value = value.substr(1, value.length - 2);
            }
            XPathStringLiteral.prototype.toXPath = function () {
                return "" + this.stringDelimiter + this.value + this.stringDelimiter;
            };
            return XPathStringLiteral;
        }());
        XPathModels.XPathStringLiteral = XPathStringLiteral;
        var XPathNumericLiteral = (function () {
            function XPathNumericLiteral(value) {
                this.value = value;
                this.type = 'numeric';
            }
            XPathNumericLiteral.prototype.toXPath = function () {
                return "" + this.value;
            };
            return XPathNumericLiteral;
        }());
        XPathModels.XPathNumericLiteral = XPathNumericLiteral;
    })(XPathModels = exports.XPathModels || (exports.XPathModels = {}));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtbW9kZWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vdHMvcGFyc2VyL3hwYXRoLW1vZGVscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDQSxJQUFjLFdBQVcsQ0FrWHhCO0lBbFhELFdBQWMsV0FBVztRQUNWLHVCQUFXLEdBQUcsS0FBSyxDQUFDO1FBZ0IvQjtZQUF5QixjQUFpQjtpQkFBakIsVUFBaUIsRUFBakIscUJBQWlCLEVBQWpCLElBQWlCO2dCQUFqQix5QkFBaUI7O1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLFlBQUEsV0FBVyxDQUFDLENBQUMsQ0FBQztnQkFDZCxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNuQyxDQUFDO1FBQ0wsQ0FBQztRQUplLG9CQUFRLFdBSXZCLENBQUE7UUFFRCwwQkFBaUMsSUFBWTtZQUN6QyxNQUFNLENBQUMsSUFBSSxJQUFJLGFBQWEsQ0FBQztRQUNqQyxDQUFDO1FBRmUsNEJBQWdCLG1CQUUvQixDQUFBO1FBRUQ7WUFDSSxvQkFBbUIsT0FBZSxFQUFTLElBQWU7Z0JBQXZDLFlBQU8sR0FBUCxPQUFPLENBQVE7Z0JBQVMsU0FBSSxHQUFKLElBQUksQ0FBVztZQUMxRCxDQUFDO1lBQ0wsaUJBQUM7UUFBRCxDQUFDLEFBSEQsSUFHQztRQUhZLHNCQUFVLGFBR3RCLENBQUE7UUFFRCxvQkFDSSxHQUFXLEVBQ1gsSUFBZTtZQUNmLE1BQU0sSUFBSSxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFKZSxzQkFBVSxhQUl6QixDQUFBO1FBRUQsSUFBWSx1QkFLWDtRQUxELFdBQVksdUJBQXVCO1lBQy9CLDhDQUFtQixDQUFBO1lBQ25CLHVDQUFZLENBQUE7WUFDWiwyQ0FBZ0IsQ0FBQTtZQUNoQix3Q0FBYSxDQUFBO1FBQ2pCLENBQUMsRUFMVyx1QkFBdUIs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