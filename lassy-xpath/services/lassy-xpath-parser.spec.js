"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lassy_xpath_parser_1 = require("./lassy-xpath-parser");
describe("XPath Parser Service", function () {
    var parserService;
    beforeEach(function () {
        parserService = new lassy_xpath_parser_1.LassyXPathParser();
    });
    it('Accepts valid input', function () {
        var parsed = parserService.parse('//node[@rel="hd"]');
        expect(parsed.expression).toBeTruthy();
        expect(parsed.warnings.length).toEqual(0);
        expect(parsed.error).toBeFalsy();
    });
    it('Gives warning for invalid element name', function () {
        expectWarnings('//node', []);
        expectWarnings('//mode', [{ startLine: 0, lastLine: 0, startColumn: 2, lastColumn: 6, message: 'Unknown element mode' }]);
        expectWarnings('//node[node and node]', []);
        expectWarnings('//node[foo and bar]', [
            { startLine: 0, lastLine: 0, startColumn: 7, lastColumn: 10, message: 'Unknown element foo' },
            { startLine: 0, lastLine: 0, startColumn: 15, lastColumn: 18, message: 'Unknown element bar' }
        ]);
        expectWarnings('//node[fn:replace(node)]', []);
        expectWarnings('//node[fn:replace(foo)]', [{ startLine: 0, lastLine: 0, startColumn: 18, lastColumn: 21, message: 'Unknown element foo' }]);
    });
    it('Gives warning for invalid attribute names', function () {
        expectWarnings('//node[@end]', []);
        expectWarnings('//node[@foo]', [{ startLine: 0, lastLine: 0, startColumn: 7, lastColumn: 11, message: 'Unknown attribute @foo' }]);
        expectWarnings('//node[@foo="test" and @bar]', [
            { startLine: 0, lastLine: 0, startColumn: 7, lastColumn: 11, message: 'Unknown attribute @foo' },
            { startLine: 0, lastLine: 0, startColumn: 23, lastColumn: 27, message: 'Unknown attribute @bar' }
        ]);
        expectWarnings('//node[lower-case(@foo)="hello"]', [{ startLine: 0, lastLine: 0, startColumn: 18, lastColumn: 22, message: 'Unknown attribute @foo' }]);
    });
    it('Gives warning for invalid attribute values', function () {
        expectWarnings('//node[@case="nom"]', []);
        expectWarnings('//node[@case!="nom"]', []);
        expectWarnings('//node[@case!="foo"]', [{ startLine: 0, lastLine: 0, startColumn: 14, lastColumn: 19, message: 'Unknown attribute value "foo"' }]);
        expectWarnings('//node[@case="foo" and @case="bar"]', [
            { startLine: 0, lastLine: 0, startColumn: 13, lastColumn: 18, message: 'Unknown attribute value "foo"' },
            { startLine: 0, lastLine: 0, startColumn: 29, lastColumn: 34, message: 'Unknown attribute value "bar"' }
        ]);
    });
    function expectWarnings(xpath, expectedWarnings) {
        var parsed = parserService.parse(xpath);
        expect(parsed.expression).toBeTruthy("Parse failed: " + xpath);
        expect(parsed.warnings).toEqual(expectedWarnings);
    }
});
