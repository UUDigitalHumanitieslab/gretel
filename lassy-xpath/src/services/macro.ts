/**
 * The macro service is used to replace macro variables in the XPATH with the macro value.
 * This is done using the same syntax as used by PaQU e.g. `%PQ_example%`. 
 */
export class Macro {
    /**
     * defined statically, to make it available in the XPATH mode
     */
    private static macroLookup: MacroLookup = {};

    private loaded: () => void;
    /**
     * Waits for the definitions to be loaded
     */
    public onceLoaded: Promise<boolean> = new Promise<boolean>((resolve, reject) => {
        this.loaded = () => {
            resolve();
            this.loaded = () => { };
        };
    });

    constructor() {
    }

    /**
     * Loads the macro definitions from the passed text data. 
     * @param data The definitions to load.
     */
    public loadFromText(data: string): void {
        Macro.macroLookup = this.parseValues(data);
        this.loaded();
    }

    public getMacros(): MacroLookup {
        return Macro.macroLookup;
    }

    /**
     * Find all the macro references in the specified XPATH and returns their replacements.
     * @param value 
     * @returns The replacements which were performed (should be repeated sequentially) and the replacement results,
     * if no replacements were performed the result is false.
     */
    public enrich(value: string): { replacements: MacroReplacement[], result: string | false } {
        let macroCalls = /%([^\%\s]+)%/g;
        let macroCall: RegExpExecArray;
        let result: string[] = [''];
        let appendResult = (text: string) => {
            result.splice(
                result.length - 1,
                1,
                ...(result[result.length - 1] + text).split('\n'));
        }

        let macroReplacements: MacroReplacement[] = [];
        let lastIndex = 0;
        while ((macroCall = macroCalls.exec(value)) != null) {
            let replacement: string
            try {
                replacement = Macro.macroLookup[macroCall[1]].trim();
            } catch (error) {
                console.warn(`Unknown macro call? ${macroCall[1]}`);
                console.warn(error);
                continue;
            }

            appendResult(value.substring(lastIndex, macroCall.index));

            // enrich again! macros can also contain macro calls!
            // perform any recursion directly, don't let the editor do this heavy work
            replacement = this.enrich(replacement).result || replacement;

            let callLength = macroCall[1].length + 2;
            macroReplacements.push({
                offset: result[result.length - 1].length,
                line: result.length - 1,
                length: callLength,
                value: replacement
            });
            appendResult(replacement);
            lastIndex = macroCall.index + callLength;
        }

        return {
            replacements: macroReplacements,
            result: macroReplacements.length ? result.join('\n') + value.substring(lastIndex) : false
        };
    }

    /**
     * Parses the macro definition text and returns all the macro names and their replacement values.
     * The macro definition should contain macro names (e.g. PQ_example) followed by the value to
     * place in the XPATH instead of this macro call, which is surrounded by """.
     * @param data The macro definition text
     */
    private parseValues(data: string): MacroLookup {
        let macroLookup: MacroLookup = {};
        let macroPattern = /\b(.*)\b\s*=\s*"""([\s\S]*?)"""/g;
        let match: RegExpExecArray;
        while ((match = macroPattern.exec(data)) != null) {
            macroLookup[match[1]] = match[2];

        }

        return macroLookup;
    }
}

export type MacroLookup = { [name: string]: string };
export type MacroReplacement = {
    offset: number,
    /**
     * Zero-based line number
     */
    line: number,
    length: number,
    value: string
};