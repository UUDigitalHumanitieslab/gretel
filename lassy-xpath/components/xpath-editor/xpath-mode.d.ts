import 'brace/mode/javascript';
import 'brace/mode/xquery';
import * as ace from 'brace';
export declare let TextMode: {
    new (): any;
};
export declare let XQueryBehaviour: AceBehaviour;
export declare const modeName = "xpath";
export default class XPathMode extends TextMode {
    constructor();
    completer: Completer;
    $behaviour: XPathBehaviour;
}
export declare class Completer {
    private attributesCompletions;
    private allCompletions;
    /**
     * Only show attribute auto-completions.
     */
    static onlyAttributes: boolean;
    /**
     * Only show macro auto-completions.
     */
    static onlyMacros: boolean;
    private getAttributeCompletions(currentToken, iterator);
    private getFunctionCompletions(currentToken, iterator);
    private getMacroCompletions();
    getCompletions(editor: ace.Editor, session: ace.IEditSession, position: {
        column: number;
        row: number;
    }, prefix: string, callback: (error: string | null, data: {
        value: string;
        score: number;
        meta: string;
    }[]) => void): void;
}
/**
 * Add additional XPATH behavior to autocomplete macros, functions and attributes.
 */
export declare class XPathBehaviour extends XQueryBehaviour {
    constructor();
    private startAutocomplete(editor);
}
export interface AceBehaviour {
    new (): {
        add(name: string, action: string, callback: (state: string[], action: string, editor: ace.Editor, session: ace.IEditSession, text: string) => AceHandlerResult): void;
        addBehaviours(behaviours: {
            [name: string]: AceBehaviour;
        }): void;
        inherit(mode: AceBehaviour, filter: string[]): void;
        remove(name: string): void;
    };
}
export declare type AceHandlerResult = {
    text: string;
    selection: number[] | void;
} | void;
