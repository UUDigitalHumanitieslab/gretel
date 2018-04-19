"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xpath_attributes_1 = require("../common/xpath-attributes");
var ts_xpath_1 = require("ts-xpath");
var elementNames = ['item', 'meta', 'metadata', 'node', 'parser', 'sentence'];
var LassyXPathParser = /** @class */ (function () {
    function LassyXPathParser() {
        this.parser = new ts_xpath_1.XPathParser();
    }
    LassyXPathParser.prototype.parse = function (xpath) {
        var expression;
        var error = null;
        if (!xpath) {
            return { expression: null, warnings: [], error: null };
        }
        try {
            expression = this.parser.parse(xpath);
            error = null;
        }
        catch (exception) {
            if (exception instanceof ts_xpath_1.XPathModels.ParseError) {
                expression = null;
                var startColumn = exception.hash.loc ? exception.hash.loc.first_column : undefined;
                error = {
                    lastLine: exception.hash.line,
                    lastColumn: startColumn && exception.hash.token ? startColumn + exception.hash.token.length : undefined,
                    startLine: exception.hash.line,
                    startColumn: startColumn,
                    message: exception.message,
                };
            }
            else {
                throw error;
            }
        }
        return {
            expression: expression,
            warnings: expression ? this.getWarnings([expression]) : [],
            error: error
        };
    };
    LassyXPathParser.prototype.createWarning = function (message, location, offset) {
        if (offset === void 0) { offset = -1; }
        return {
            startLine: location.firstLine - 1,
            startColumn: location.firstColumn + offset,
            lastColumn: location.lastColumn,
            lastLine: location.lastLine - 1,
            message: message
        };
    };
    LassyXPathParser.prototype.getWarnings = function (expressions) {
        var warnings = [];
        for (var _i = 0, expressions_1 = expressions; _i < expressions_1.length; _i++) {
            var expression = expressions_1[_i];
            if (expression.type == 'path') {
                warnings.push.apply(warnings, this.getPathWarnings(expression));
            }
            else if (expression.type == 'operation') {
                warnings.push.apply(warnings, this.getOperationWarnings(expression));
            }
            else if (expression.type == 'function') {
                // check the arguments of a function
                warnings.push.apply(warnings, this.getWarnings(expression.getChildren()));
            }
        }
        return warnings;
    };
    LassyXPathParser.prototype.getOperationWarnings = function (expression) {
        var children = expression.getChildren();
        if (expression.operationType == '!=' || expression.operationType == '==') {
            // check the value of an attribute expression (e.g. @rel="hd"")
            var left = children[0], right = children[1];
            if (left.type == 'path' &&
                left.steps.length &&
                left.steps[0].properties.axis == 'attribute' &&
                right.type == 'string') {
                // to the left is an attribute path, to the right a string value expression
                var attributeName = left.steps[0].properties.name;
                var attribute = xpath_attributes_1.XpathAttributes[attributeName];
                var attributeValue_1 = right.value;
                if (attribute && attribute.values.length && attribute.values.findIndex(function (val) { return val[0] == attributeValue_1; }) == -1) {
                    return [this.createWarning("Unknown attribute value \"" + attributeValue_1 + "\"", right.location, 0)];
                }
            }
        }
        return this.getWarnings(children);
    };
    LassyXPathParser.prototype.getPathWarnings = function (expression) {
        var warnings = [];
        for (var _i = 0, _a = expression.steps; _i < _a.length; _i++) {
            var step = _a[_i];
            if (step.properties.axis == 'attribute') {
                // check the attribute's name
                if (!xpath_attributes_1.XpathAttributes[step.properties.name]) {
                    warnings.push(this.createWarning("Unknown attribute @" + step.properties.name, step.properties.location));
                }
            }
            else if (step.properties.test == 'name') {
                // check the element name
                if (elementNames.indexOf(step.properties.name) == -1) {
                    var warning = this.createWarning("Unknown element " + step.properties.name, step.properties.location, 0);
                    warnings.push(warning);
                }
            }
            warnings.push.apply(warnings, this.getWarnings(step.getChildren()));
        }
        return warnings;
    };
    return LassyXPathParser;
}());
exports.LassyXPathParser = LassyXPathParser;
