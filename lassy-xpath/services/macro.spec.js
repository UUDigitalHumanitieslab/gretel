"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var macro_1 = require("./macro");
describe("Macro service", function () {
    var macroService;
    beforeEach(function () {
        macroService = new macro_1.Macro();
    });
    it("parses", function () {
        macroService.loadFromText("PQ_b = \"\"\" number(@begin) \"\"\"\n            PQ_e = \"\"\" number(@end) \"\"\"\n            PQ_i = \"\"\"\n            number(@index)\n            \"\"\"");
        expect(macroService.enrich('//node[%PQ_e%]').result).toEqual('//node[number(@end)]');
    });
    it("parser multi line", function () {
        macroService.loadFromText("PQ_nachfeld = \"\"\"\n            ( node\n            and\n            not(node)\n            ) \"\"\"\n\n            PQ_nachfeld_node = \"\"\" //node[%PQ_nachfeld%] \"\"\"");
        expect(macroService.enrich('%PQ_nachfeld_node%').result).toEqual("//node[( node\n            and\n            not(node)\n            )]");
    });
    it("recurses", function () {
        macroService.loadFromText("PQ_a = \"\"\"//node[%PQ_c%]\"\"\"\n            PQ_b = \"\"\" number(@index) \"\"\"\n            PQ_c = \"\"\" @cat and %PQ_b% \"\"\"\n            PQ_begin_of_head = \"\"\" node[%PQ_headrel%]/%PQ_b% \"\"\"\n            PQ_headrel = \"\"\"\n            ( @rel=\"hd\"\n            or\n            @rel=\"cmp\"\n            or\n            @rel=\"mwp\"\n            or\n            @rel=\"crd\"\n            or\n            @rel=\"rhd\"\n            or\n            @rel=\"whd\"\n            or\n            @rel=\"nucl\"\n            or\n            @rel=\"dp\"\n            ) \"\"\"");
        expect(macroService.enrich('%PQ_a%').result).toEqual('//node[@cat and number(@index)]');
        expect(macroService.enrich('%PQ_begin_of_head%').replacements.length).toEqual(1, 'Recursion should be pre-calculated');
        expect(macroService.enrich('%PQ_begin_of_head%').result).toEqual("node[( @rel=\"hd\"\n            or\n            @rel=\"cmp\"\n            or\n            @rel=\"mwp\"\n            or\n            @rel=\"crd\"\n            or\n            @rel=\"rhd\"\n            or\n            @rel=\"whd\"\n            or\n            @rel=\"nucl\"\n            or\n            @rel=\"dp\"\n            )]/number(@index)");
    });
    it('multiple replacements', function () {
        macroService.loadFromText("PQ_i = \"\"\"number(@index)\"\"\"\n            PQ_b = \"\"\" number(@begin) \"\"\"");
        var value = '%PQ_i% and %PQ_b%';
        var expected = 'number(@index) and number(@begin)';
        var enrichment = macroService.enrich(value);
        expect(enrichment.result).toEqual(expected);
        expect(performReplacements(value, enrichment.replacements)).toEqual(expected, 'Replacements should be relative');
    });
    /**
     * Simulate performing multiple replacements in the editor sequentially
     * @param value
     * @param replacements
     */
    function performReplacements(value, replacements) {
        if (!replacements.length) {
            return false;
        }
        var lines = value.split('\n');
        for (var _i = 0, replacements_1 = replacements; _i < replacements_1.length; _i++) {
            var replacement = replacements_1[_i];
            var replacedLine = lines[replacement.line].substring(0, replacement.offset)
                + replacement.value
                + lines[replacement.line].substring(replacement.offset + replacement.length);
            // the line might have been replaced with multiple
            var replacedLines = replacedLine.split('\n');
            lines.splice.apply(lines, [replacement.line, 1].concat(replacedLines));
        }
        return lines.join('\n');
    }
});
