define(["require", "exports", "./xpath-extractinator", "./parser/xpath-models"], function (require, exports, xpath_extractinator_1, xpath_models_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("XPath Extractinator", function () {
        var extractinator;
        beforeEach(function () {
            extractinator = new xpath_extractinator_1.XPathExtractinator();
        });
        it("Ignores empty input", function () {
            expectExtract('', [], false);
        });
        it("Ignores malformed input", function () {
            var parseError = null;
            var result = null;
            try {
                result = extractinator.extract('//node[');
            }
            catch (error) {
                if (error instanceof xpath_models_1.XPathModels.ParseError) {
                    parseError = error;
                }
            }
            expect(result).toBeFalsy('No results should be returned if the input is malformed!');
            expect(parseError).toBeTruthy('No ParseError was thrown!');
        });
        it("Extracts root", function () {
            expectExtract('//node', [], false);
        });
        it("Ignores parent's attributes", function () {
            expectExtract('//node[@pt="vnw"]', []);
        });
        it("Extracts child", function () {
            expectExtract('//node[node]', [{ name: '$node1', path: '$node/node' }]);
        });
        it("Extracts child with attributes", function () {
            expectExtract('//node[node[@pt="vnw" and @rel="su"]]', [{ name: '$node1', path: '$node/node[@pt = "vnw" and @rel = "su"]' }]);
        });
        it("Extracts multiple children", function () {
            expectExtract('//node[@cat="smain" and node and node[@cat="np"]]', [{ name: '$node1', path: '$node/node' },
                { name: '$node2', path: '$node/node[@cat = "np"]' }]);
        });
        it("Extracts sub-children", function () {
            expectExtract('//node[node[node and node[@pt="lid"]]]', [{ name: '$node1', path: '$node/node[node and node[@pt = "lid"]]' },
                { name: '$node2', path: '$node1/node' },
                { name: '$node3', path: '$node1/node[@pt = "lid"]' }]);
        });
        it("Extracts union", function () {
            expectExtract('//node[node[@pt = "lid"] | node[@pt="vnw" and number(@begin) > 5]]', [{ name: '$node1', path: '$node/node[@pt = "lid"]' },
                { name: '$node2', path: '$node/node[@pt = "vnw" and number(@begin) > 5]' }]);
        });
        var expectExtract = function (xpath, expected, checkOrdered) {
            if (checkOrdered === void 0) { checkOrdered = true; }
            var result = extractinator.extract(xpath);
            expect(result).toEqual(expected, xpath);
            var subPath = xpath.substring('//node['.length, xpath.length - 1);
            if (checkOrdered) {
                xpath = "//node[@cat=\"smain\" and not(.//node[position() < last()][number(@begin) > number(following-sibling::node/@begin)]) and " + subPath + "]";
                var orderedResult = extractinator.extract(xpath);
                expect(orderedResult).toEqual(expected, xpath);
            }
        };
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZXh0cmFjdGluYXRvci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMveHBhdGgtZXh0cmFjdGluYXRvci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBR0EsUUFBUSxDQUFDLHFCQUFxQixFQUMxQjtRQUNJLElBQUksYUFBaUMsQ0FBQztRQUV0QyxVQUFVLENBQUM7WUFDUCxhQUFhLEdBQUcsSUFBSSx3Q0FBa0IsRUFBRSxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLHFCQUFxQixFQUFFO1lBQ3RCLGFBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHlCQUF5QixFQUFFO1lBQzFCLElBQUksVUFBVSxHQUFrQyxJQUFJLENBQUM7WUFDckQsSUFBSSxNQUFNLEdBQTBCLElBQUksQ0FBQztZQUN6QyxJQUFJLENBQUM7Z0JBQ0QsTUFBTSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUNELEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxDQUFDLENBQUMsS0FBSyxZQUFZLDBCQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztvQkFDMUMsVUFBVSxHQUFHLEtBQUssQ0FBQztnQkFDdkIsQ0FBQztZQUNMLENBQUM7WUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7WUFDckYsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQy9ELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGVBQWUsRUFBRTtZQUVoQixhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2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