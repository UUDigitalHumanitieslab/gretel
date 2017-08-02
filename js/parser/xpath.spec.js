define(["require", "exports", "./xpath", "./xpath-models"], function (require, exports, parser, xpath_models_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("XPath Parser", function () {
        beforeAll(function () {
            parser.yy = { xpathModels: xpath_models_1.XPathModels };
        });
        it("Works", function () {
            var parsed = parser.parse("//node");
            expect(parsed).toBeTruthy();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGguc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL3BhcnNlci94cGF0aC5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBR0EsUUFBUSxDQUFDLGNBQWMsRUFDbkI7UUFDSSxTQUFTLENBQUM7WUFFTCxNQUFjLENBQUMsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLDBCQUFXLEVBQUUsQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxPQUFPLEVBQUU7WUFDUixJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3BDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUNoQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDIn0=