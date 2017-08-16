define(["require", "exports", "../parser/xpath", "../parser/xpath-models"], function (require, exports, parser, xpath_models_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var XPathParserService = (function () {
        function XPathParserService() {
            parser.yy = {
                xpathModels: xpath_models_1.XPathModels,
                parseError: xpath_models_1.XPathModels.parseError
            };
        }
        XPathParserService.prototype.parse = function (xpath) {
            var expression;
            var error;
            if (!xpath) {
                return { expression: null, error: null };
            }
            try {
                expression = parser.parse(xpath);
                error = null;
            }
            catch (exception) {
                if (exception instanceof xpath_models_1.XPathModels.ParseError) {
                    expression = null;
                    error = {
                        length: exception.hash.token ? exception.hash.token.length : undefined,
                        line: exception.hash.line,
                        message: exception.message,
                        offset: exception.hash.loc ? exception.hash.loc.first_column : undefined
                    };
                }
                else {
                    throw error;
                }
            }
            return {
                expression: expression, error: error
            };
        };
        return XPathParserService;
    }());
    exports.default = XPathParserService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtcGFyc2VyLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy9zZXJ2aWNlcy94cGF0aC1wYXJzZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUdBO1FBQ0k7WUFFSyxNQUFjLENBQUMsRUFBRSxHQUFHO2dCQUNqQixXQUFXLEVBQUUsMEJBQVc7Z0JBQ3hCLFVBQVUsRUFBRSwwQkFBVyxDQUFDLFVBQVU7YUFDckMsQ0FBQztRQUdOLENBQUM7UUFFTSxrQ0FBSyxHQUFaLFVBQWEsS0FBYTtZQUN0QixJQUFJLFVBQThDLENBQUM7WUFDbkQsSUFBSSxLQUF3QixDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDVCxNQUFNLENBQUMsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsQ0FBQztZQUM3QyxDQUFDO1lBQ0QsSUFBSSxDQUFDO2dCQUNELFVBQVUsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqQyxLQUFLLEdBQUcsSUFBSSxDQUFDO1lBQ2pCLENBQUM7WUFBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixFQUFFLENBQUMsQ0FBQyxTQUFTLFlBQVksMEJBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxVQUFVLEdBQUcsSUFBSSxDQUFDO29CQUNsQixLQUFLLEdBQUc7d0JBQ0osTUFBTSxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxTQUFTO3dCQUN0RSxJQUFJLEVBQUUsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJO3dCQUN6QixPQUFPLEVBQUUsU0FBUyxDQUFDLE9BQU87d0JBQzFCLE1BQU0sRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLEdBQUcsU0FBUztxQkFDM0UsQ0FBQztnQkFDTixDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLE1BQU0sS0FBSyxDQUFDO2dCQUNoQixDQUFDO1lBQ0wsQ0FBQztZQUVELE1BQU0sQ0FBQztnQkFDSCxVQUFVLFlBQUEsRUFBRSxLQUFLLE9BQUE7YUFDcEIsQ0FBQTtRQUNMLENBQUM7UUFDTCx5QkFBQztJQUFELENBQUMsQUF0Q0QsSUFzQ0MifQ==