define(["require", "exports", "./xpath-extractinator"], function (require, exports, xpath_extractinator_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    describe("XPath Extractinator", function () {
        var extractinator;
        beforeEach(function () {
            extractinator = new xpath_extractinator_1.XPathExtractinator();
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
            expectExtract('//node[node | node[@pt="vnw" and number(@begin) > 5]]', [{ name: '$node1', path: '$node/node' },
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZXh0cmFjdGluYXRvci5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vdHMveHBhdGgtZXh0cmFjdGluYXRvci5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRUEsUUFBUSxDQUFDLHFCQUFxQixFQUMxQjtRQUNJLElBQUksYUFBaUMsQ0FBQztRQUV0QyxVQUFVLENBQUM7WUFDUCxhQUFhLEdBQUcsSUFBSSx3Q0FBa0IsRUFBRSxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFBO1FBRUYsRUFBRSxDQUFDLGVBQWUsRUFBRTtZQUVoQixhQUFhLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN2QyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRTtZQUM5QixhQUFhLENBQUMsbUJBQW1CLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsZ0JBQWdCLEVBQUU7WUFDakIsYUFBYSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdDQUFnQyxFQUFFO1lBQ2pDLGFBQWEsQ0FBQyx1Q0FBdUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUseUNBQXlDLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDbEksQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsNEJBQTRCLEVBQUU7WUFDN0IsYUFBYSxDQUNULG1EQUFtRCxFQUNuRCxDQUFDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsWUFBWSxFQUFFO2dCQUN2QyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLHlCQUF5QixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzlELENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHVCQUF1QixFQUFFO1lBQ3hCLGFBQWEsQ0FDVCx3Q0FBd0MsRUFDeEMsQ0FBQyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLHdDQUF3QyxFQUFFO2dCQUNuRSxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRTtnQkFDdkMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSwwQkFBMEIsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxnQkFBZ0IsRUFBRTtZQUNqQixhQUFhLENBQ1QsdURBQXVELEVBQ3ZELENBQUMsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxZQUFZLEVBQUU7Z0JBQ3ZDLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsZ0RBQWdELEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLGFBQWEsR0FBRyxVQUFDLEtBQWEsRUFBRSxRQUF3QixFQUFFLFlBQTRCO1lBQTVCLDZCQUFBLEVBQUEsbUJBQTRCO1lBQ3RGLElBQUksTUFBTSxHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFFbEUsRUFBRSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztnQkFDZixLQUFLLEdBQUcsOEhBQTBILE9BQU8sTUFBRyxDQUFDO2dCQUM3SSxJQUFJLGFBQWEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNqRCxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNuRCxDQUFDO1FBQ0wsQ0FBQyxDQUFBO0lBQ0wsQ0FBQyxDQUFDLENBQUMifQ==