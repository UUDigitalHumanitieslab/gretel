define(["require", "exports", "./parser/xpath", "./parser/xpath-models"], function (require, exports, parser, xpath_models_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var XPathExtractinator = (function () {
        function XPathExtractinator() {
            parser.yy = {
                xpathModels: xpath_models_1.XPathModels,
                parseError: xpath_models_1.XPathModels.parseError
            };
        }
        XPathExtractinator.prototype.extract = function (xPath) {
            if (!xPath || !xPath.trim()) {
                return [];
            }
            var parsed = parser.parse(xPath);
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
    var FormatError = (function () {
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
    var NameGenerator = (function () {
        function NameGenerator() {
            this.index = 1;
        }
        NameGenerator.prototype.get = function () {
            return "$node" + this.index++;
        };
        return NameGenerator;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZXh0cmFjdGluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL3hwYXRoLWV4dHJhY3RpbmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFHQTtRQUNJO1lBRUssTUFBYyxDQUFDLEVBQUUsR0FBRztnQkFDakIsV0FBVyxFQUFFLDBCQUFXO2dCQUN4QixVQUFVLEVBQUUsMEJBQVcsQ0FBQyxVQUFVO2FBQ3JDLENBQUM7UUFHTixDQUFDO1FBUUQsb0NBQU8sR0FBUCxVQUFRLEtBQWE7WUFDakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFBQyxDQUFDO1lBQzNDLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkIsTUFBTSxJQUFJLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDeEMsQ0FBQztnQkFFRCxJQUFJLGVBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFNLE9BQUEsZUFBYSxDQUFDLEdBQUcsRUFBRSxFQUFuQixDQUFtQixDQUFDLENBQUM7Z0JBQ3BHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDbEIsQ0FBQztZQUVELE1BQU0sQ0FB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