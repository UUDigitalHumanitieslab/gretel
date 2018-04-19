import { TextHighlightRules } from './text-highlight-rules';
export declare const identifierRe = "[a-zA-Z\\$_¡-￿][a-zA-Z\\d\\$_¡-￿]*";
export declare const equalityRe = "(=|!=|<=|<|>=|>)";
/**
 * Highlighter to use by ACE text editor for highlighting the different tokens in an XPATH string.
 */
export declare class XPathHighlighterRules extends TextHighlightRules {
    constructor();
}
