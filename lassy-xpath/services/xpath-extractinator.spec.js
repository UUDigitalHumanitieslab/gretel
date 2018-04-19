"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xpath_extractinator_1 = require("./xpath-extractinator");
var ts_xpath_1 = require("ts-xpath");
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
            if (error instanceof ts_xpath_1.XPathModels.ParseError) {
                parseError = error;
            }
        }
        expect(result).toBeFalsy('No results should be returned if the input is malformed!');
        expect(parseError).toBeTruthy('No ParseError was thrown!');
    });
    it("Extracts root", function () {
        // the root is implicit and called $node; it shouldn't be returned as extracted
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
