/**
 * The macro service is used to replace macro variables in the XPATH with the macro value.
 * This is done using the same syntax as used by PaQU e.g. `%PQ_example%`.
 */
export declare class Macro {
    /**
     * defined statically, to make it available in the XPATH mode
     */
    private static macroLookup;
    private loaded;
    /**
     * Waits for the definitions to be loaded
     */
    onceLoaded: Promise<boolean>;
    constructor();
    loadDefault(): void;
    /**
     * Loads the macro definitions from the passed text data.
     * @param data The definitions to load.
     */
    loadFromText(data: string): void;
    getMacros(): MacroLookup;
    /**
     * Find all the macro references in the specified XPATH and returns their replacements.
     * @param value
     * @returns The replacements which were performed (should be repeated sequentially) and the replacement results,
     * if no replacements were performed the result is false.
     */
    enrich(value: string): {
        replacements: MacroReplacement[];
        result: string | false;
    };
    /**
     * Parses the macro definition text and returns all the macro names and their replacement values.
     * The macro definition should contain macro names (e.g. PQ_example) followed by the value to
     * place in the XPATH instead of this macro call, which is surrounded by """.
     * @param data The macro definition text
     */
    private parseValues(data);
}
export declare type MacroLookup = {
    [name: string]: string;
};
export declare type MacroReplacement = {
    offset: number;
    /**
     * Zero-based line number
     */
    line: number;
    length: number;
    value: string;
};
