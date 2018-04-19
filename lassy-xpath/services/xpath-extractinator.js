"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts_xpath_1 = require("ts-xpath");
var XPathExtractinator = /** @class */ (function () {
    function XPathExtractinator() {
        this.parser = new ts_xpath_1.XPathParser();
    }
    /**
     * Extract a variable for each node matched by the query.
     * @param xPath Query to analyse.
     * @throws {XPathModels.ParseError} The provided query is malformed.
     * @throws {FormatError} The provided query is in an unexpected format.
     */
    XPathExtractinator.prototype.extract = function (xPath) {
        if (!xPath || !xPath.trim()) {
            return [];
        }
        var parsed = this.parser.parse(xPath);
        // expect any query to at least start with //node
        if (parsed.type == 'path') {
            var children = parsed.getChildren();
            if (children.length != 2) {
                throw new FormatError('path_start');
            }
            var nameGenerator_1 = new NameGenerator();
            var result = this.extractRecursively("$node", children[1].getChildren(), function () { return nameGenerator_1.get(); });
            return result;
        }
        return [];
    };
    XPathExtractinator.prototype.extractRecursively = function (parentName, children, nameGenerator) {
        var result = [];
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            switch (child.type) {
                case "path":
                    // this is a level below the parent e.g. $parent/*
                    var name_1 = nameGenerator();
                    result.push({ name: name_1, path: parentName + "/" + child.toXPath() });
                    for (var _a = 0, _b = child.steps; _a < _b.length; _a++) {
                        var step = _b[_a];
                        if (step.properties.axis == 'child') {
                            result.push.apply(result, this.extractRecursively(name_1, step.predicates, nameGenerator));
                        }
                        else {
                            throw new FormatError('axis_type', [step.properties.axis]);
                        }
                    }
                    break;
                case "operation":
                    // this is an operation at the current level, only interested in possible children
                    // e.g. $parent[* and *]
                    if (child.operationType == "and" || child.operationType == "or" || child.operationType == "union") {
                        result.push.apply(result, this.extractRecursively(parentName, child.getChildren(), nameGenerator));
                    }
            }
        }
        return result;
    };
    return XPathExtractinator;
}());
exports.XPathExtractinator = XPathExtractinator;
var FormatError = /** @class */ (function () {
    function FormatError(type, details) {
        if (details === void 0) { details = []; }
        this.type = type;
        this.details = details;
    }
    Object.defineProperty(FormatError.prototype, "message", {
        get: function () {
            return {
                'path_start': 'Unexpected path format! Expected it should start with //node.',
                'operation_type': "Unexpected operation type " + this.details[0] + ".",
                'axis_type': "Unknown axis type (" + this.details[0] + ")."
            }[this.type];
        },
        enumerable: true,
        configurable: true
    });
    return FormatError;
}());
exports.FormatError = FormatError;
var NameGenerator = /** @class */ (function () {
    function NameGenerator() {
        this.index = 1;
    }
    NameGenerator.prototype.get = function () {
        return "$node" + this.index++;
    };
    return NameGenerator;
}());
