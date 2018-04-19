export declare type HighlighterRules = {
    new (): HighlighterRules;
    $rules: {
        [state: string]: HighlighterRule[];
    };
    /**
     * Embed external highlighter rules into the current rule set.
     * @param rules The highlighter to embed.
     * @param prefix The prefix to place before the embedded highlighter's states.
     * @param returnRules The additional rules to transition back.
     */
    embedRules(rules: HighlighterRules, prefix: string, returnRules: HighlighterRule[]): void;
    getRules(): {
        [state: string]: HighlighterRule[];
    };
};
export declare type HighlighterRule = {
    token?: string | string[] | ((value: string) => string);
    regex: string | RegExp;
    next?: string;
    nextState?: string;
    onMatch?: ((val: string, state: string, stack: string[]) => string);
} | {
    /** Include the rules of this state. */
    include: string;
} | {
    defaultToken: string;
};
