import { Macro as MacroService, MacroReplacement } from './macro';

describe("Macro service", () => {
    let macroService: MacroService;
    beforeEach(() => {
        macroService = new MacroService();
    })

    it("parses", () => {
        macroService.loadFromText(`PQ_b = """ number(@begin) """
            PQ_e = """ number(@end) """
            PQ_i = """
            number(@index)
            """`);
        expect(macroService.enrich('//node[%PQ_e%]').result).toEqual('//node[number(@end)]')
    });

    it("parser multi line", () => {
        macroService.loadFromText(`PQ_nachfeld = """
            ( node
            and
            not(node)
            ) """

            PQ_nachfeld_node = """ //node[%PQ_nachfeld%] """`);
        expect(macroService.enrich('%PQ_nachfeld_node%').result).toEqual(`//node[( node
            and
            not(node)
            )]`)
    });

    it("recurses", () => {
        macroService.loadFromText(`PQ_a = """//node[%PQ_c%]"""
            PQ_b = """ number(@index) """
            PQ_c = """ @cat and %PQ_b% """
            PQ_begin_of_head = """ node[%PQ_headrel%]/%PQ_b% """
            PQ_headrel = """
            ( @rel="hd"
            or
            @rel="cmp"
            or
            @rel="mwp"
            or
            @rel="crd"
            or
            @rel="rhd"
            or
            @rel="whd"
            or
            @rel="nucl"
            or
            @rel="dp"
            ) """`);
        expect(macroService.enrich('%PQ_a%').result).toEqual('//node[@cat and number(@index)]');
        expect(macroService.enrich('%PQ_begin_of_head%').replacements.length).toEqual(1, 'Recursion should be pre-calculated');
        expect(macroService.enrich('%PQ_begin_of_head%').result).toEqual(`node[( @rel="hd"
            or
            @rel="cmp"
            or
            @rel="mwp"
            or
            @rel="crd"
            or
            @rel="rhd"
            or
            @rel="whd"
            or
            @rel="nucl"
            or
            @rel="dp"
            )]/number(@index)`)
    });

    it('multiple replacements', () => {
        macroService.loadFromText(`PQ_i = """number(@index)"""
            PQ_b = """ number(@begin) """`);
        let value = '%PQ_i% and %PQ_b%';
        let expected = 'number(@index) and number(@begin)';
        let enrichment = macroService.enrich(value);

        expect(enrichment.result).toEqual(expected);
        expect(performReplacements(value, enrichment.replacements)).toEqual(expected, 'Replacements should be relative');
    })

    /**
     * Simulate performing multiple replacements in the editor sequentially
     * @param value 
     * @param replacements 
     */
    function performReplacements(value: string, replacements: MacroReplacement[]): string | false {
        if (!replacements.length) {
            return false;
        }
        let lines = value.split('\n');
        for (let replacement of replacements) {

            let replacedLine =
                lines[replacement.line].substring(0, replacement.offset)
                + replacement.value
                + lines[replacement.line].substring(replacement.offset + replacement.length);

            // the line might have been replaced with multiple
            let replacedLines = replacedLine.split('\n');
            lines.splice(replacement.line, 1, ...replacedLines);
        }
        return lines.join('\n');
    }
});
