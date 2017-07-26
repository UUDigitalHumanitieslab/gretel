define(["require", "exports", "./xpath-extractinator"], function (require, exports, xpath_extractinator_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("XPath Extractinator", function () {
        it("Works", function () {
            var extractinator = new xpath_extractinator_1.XPathExtractinator();
            var result = extractinator.extract('//node');
            console.log(result);
            expect(result).toBeTruthy();
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZXh0cmFjdGluYXRvci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vdHMveHBhdGgtZXh0cmFjdGluYXRvci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUVBLFFBQVEsQ0FBQyxxQkFBcUIsRUFDMUI7UUFDSSxFQUFFLENBQUMsT0FBTyxFQUFFO1lBQ1IsSUFBSSxhQUFhLEdBQUcsSUFBSSx3Q0FBa0IsRUFBRSxDQUFDO1lBQzdDLElBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNwQixNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQyJ9