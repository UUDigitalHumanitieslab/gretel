define(["require", "exports", "./parser/xpath", "./xpath-models"], function (require, exports, parser, xpath_models_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var XPathExtractinator = (function () {
        function XPathExtractinator() {
            parser.yy = { xpathModels: xpath_models_1.XPathModels };
        }
        XPathExtractinator.prototype.extract = function (xPath) {
            var parsed = parser.parse(xPath);
            if (parsed.type == 'path') {
                for (var _i = 0, _a = parsed.properties.steps; _i < _a.length; _i++) {
                    var step = _a[_i];
                    console.log(step);
                }
            }
            console.log(parsed);
            return [];
        };
        XPathExtractinator.prototype.findNodes = function (nameGenerator, expression) {
        };
        return XPathExtractinator;
    }());
    exports.XPathExtractinator = XPathExtractinator;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZXh0cmFjdGluYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3RzL3hwYXRoLWV4dHJhY3RpbmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0lBR0E7UUFDSTtZQUVLLE1BQWMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsMEJBQVcsRUFBRSxDQUFDO1FBQ3RELENBQUM7UUFFRCxvQ0FBTyxHQUFQLFVBQVEsS0FBYTtZQUNqQixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2pDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLElBQUksTUFBTSxDQUFDLENBQUMsQ0FBQztnQkFDeEIsR0FBRyxDQUFDLENBQWEsVUFBdUIsRUFBdkIsS0FBQSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBdkIsY0FBdUIsRUFBdkIsSUFBdUI7b0JBQW5DLElBQUksSUFBSSxTQUFBO29CQUNULE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7aUJBQ3JCO1lBQ0wsQ0FBQztZQUNELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFRcEIsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUNkLENBQUM7UUFFTyxzQ0FBUyxHQUFqQixVQUFrQixhQUEyQixFQUFFLFVBQXVDO1FBRXRGLENBQUM7UUFDTCx5QkFBQztJQUFELENBQUMsQUEzQkQsSUEyQkM7SUEzQlksZ0RBQWtCIn0=