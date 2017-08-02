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
            var parsed = parser.parse(xPath);
            if (parsed.type == 'path') {
                var children = parsed.getChildren();
                if (children.length != 2) {
                    throw new FormatException('path_start');
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
                                throw new FormatException('axis_type', [step.properties.axis]);
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
    var FormatException = (function (_super) {
        __extends(FormatException, _super);
        function FormatException(type, details) {
            if (details === void 0) { details = []; }
            var _this = _super.call(this, {
                'path_start': 'Unexpected path format! Expected it should start with //node.',
                'operation_type': "Unexpected operation type " + details[0] + ".",
                'axis_type': "Unknown axis type (" + details[0] + ")."
            }[type]) || this;
            _this.type = type;
            _this.details = details;
            return _this;
        }
        return FormatException;
    }(Error));
    exports.FormatException = FormatException;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZXh0cmFjdGluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3RzL3hwYXRoLWV4dHJhY3RpbmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBSUE7UUFDSTtZQUVLLE1BQWMsQ0FBQyxFQUFFLEdBQUc7Z0JBQ2pCLFdBQVcsRUFBRSwwQkFBVztnQkFDeEIsVUFBVSxFQUFFLDBCQUFXLENBQUMsVUFBVTthQUNyQyxDQUFDO1FBR04sQ0FBQztRQU9ELG9DQUFPLEdBQVAsVUFBUSxLQUFhO1lBQ2pCLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixJQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7Z0JBQ3BDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkIsTUFBTSxJQUFJLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDNUMsQ0FBQztnQkFFRCxJQUFJLGVBQWEsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO2dCQUN4QyxJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxjQUFNLE9BQUEsZUFBYSxDQUFDLEdBQUcsRUFBRSxFQUFuQixDQUFtQixDQUFDLENBQUM7Z0JBQ3BHLE1BQU0sQ0FBQyxNQUFNLENBQUM7WUFDbEIsQ0FBQztZQUVELE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDZCxDQUFDO1FBRU8sK0NBQWtCLEdBQTFCLFVBQTJCLFVBQWtCLEVBQUUsUUFBdUMsRUFBRSxhQUEyQjtZQUMvRyxJQUFJLE1BQU0sR0FBbUIsRUFBRSxDQUFD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