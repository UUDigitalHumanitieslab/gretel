import 'brace/mode/javascript';
import 'brace/mode/xquery';
import * as ace from 'brace';
import { functionCompletions, pathCompletions } from './alpino-xpath-completions';
import { XpathAttributes } from './xpath-attributes';
import { MacroService } from './services/macro-service';
import { AlpinoXPathHighlighter } from './alpino-xpath-highlighter-rules';
let TokenIterator: { new(session: ace.IEditSession, initialRow: number, initialColumn: number): ace.TokenIterator } = ace.acequire("ace/token_iterator").TokenIterator;
let TextMode: { new(): any } = ace.acequire('ace/mode/text').Mode;
// defined in the javascript mode!
let MatchingBraceOutdent = ace.acequire("ace/mode/matching_brace_outdent").MatchingBraceOutdent;
let CstyleBehaviour: AceBehaviour = ace.acequire('ace/mode/behaviour/cstyle').CstyleBehaviour;
let XQueryBehaviour: AceBehaviour = ace.acequire('ace/mode/behaviour/xquery').XQueryBehaviour;
let TextHighlightRules: any = ace.acequire('ace/mode/text_highlight_rules').TextHighlightRules;

let macroService = new MacroService();

export const modeName = 'xpath';
export default class XPathMode extends TextMode {
    constructor() {
        super();
        this.HighlightRules = AlpinoXPathHighlighter;
        this.$outdent = new MatchingBraceOutdent();
    }

    public completer = new Completer();
    public $behaviour = new XPathBehaviour();
}

// see https://github.com/thlorenz/brace/pull/98
(ace as any).define(modeName, [], { Mode: XPathMode });

export class Completer {
    private attributesCompletions = Object.keys(XpathAttributes).map(key => {
        return { value: key, meta: XpathAttributes[key].description, score: 500 }
    });

    private allCompletions = Object.keys(functionCompletions).map(func => {
        return { value: func, meta: functionCompletions[func].meta, score: 500 };
    }).concat(pathCompletions.concat(this.attributesCompletions.map(completion => {
        return {
            value: '@' + completion.value,
            meta: completion.meta,
            score: completion.score
        }
    })));

    // TODO: look into using ACE states for this instead
    /**
     * Only show attribute auto-completions.
     */
    static onlyAttributes = false;
    /**
     * Only show macro auto-completions.
     */
    static onlyMacros = false;

    private getAttributeCompletions(currentToken: TokenInfoWithType, iterator: ace.TokenIterator) {
        let token = currentToken;
        if (token.type && token.type == "attribute.string") {
            iterator.stepBackward();
            iterator.stepBackward();
            token = iterator.getCurrentToken() as TokenInfoWithType;
            if (token && token.value && token.value.startsWith('@')) {
                let name = token.value.substring(1);
                let attribute = XpathAttributes[name];
                let values = attribute ? attribute.values : [];
                if (values) {
                    return values.map(value => { return { value: value[0], meta: value[1], score: 500 } });
                }
            }
        }

        return false;
    }

    private getFunctionCompletions(currentToken: TokenInfoWithType, iterator: ace.TokenIterator) {
        // TODO: implement!
        return [] as { value: string, meta: string, score: number }[];
    }

    private getMacroCompletions(): { value: string, meta: string, score: number }[] {
        if (Completer.onlyMacros || !Completer.onlyAttributes) {
            let macroLookup = macroService.getMacros();
            return Object.keys(macroLookup).map(macro => {
                return {
                    value: `${!Completer.onlyMacros ? '%' : ''}${macro}%`,
                    meta: macroLookup[macro].trim().replace(/\s\s+/g, ' '),
                    score: 500
                }
            });
        }

        return [];
    }

    public getCompletions(editor: ace.Editor,
        session: ace.IEditSession,
        position: { column: number, row: number },
        prefix: string,
        callback: (error: string | null, data: { value: string, score: number, meta: string }[]) => void) {
        let createIterator = () => new TokenIterator(session, position.row, position.column);
        let iterator = createIterator();
        let currentToken = iterator.getCurrentToken() as TokenInfoWithType;
        let attributeCompletions = this.getAttributeCompletions(currentToken, iterator);
        if (attributeCompletions) {
            callback(null, attributeCompletions);
            return;
        }

        if (currentToken.value.startsWith("@")) {
            callback(null, this.attributesCompletions.concat([]));
            Completer.onlyAttributes = false;
        } else if (currentToken.type && currentToken.type.startsWith("function")) {
            callback(null, this.getFunctionCompletions(currentToken, createIterator()));
        } else {
            let macroCompletions = this.getMacroCompletions();
            if (Completer.onlyMacros) {
                callback(null, macroCompletions);
                Completer.onlyMacros = false;
            } else {
                callback(null, this.allCompletions.concat(macroCompletions));
            }
        }
    }
}

/**
 * Add additional XPATH behavior to autocomplete macros, functions and attributes.
 */
class XPathBehaviour extends XQueryBehaviour {
    constructor() {
        super();
        this.inherit(CstyleBehaviour, ["brackets", "string_dquotes"]);
        this.add("autoclosing", "insertion", (
            state: string[],
            action: string,
            editor: ace.Editor,
            session: ace.IEditSession,
            text: string): AceHandlerResult => {
            if (text.endsWith('()')) {
                let func = functionCompletions[text];
                if (func && func.hasArguments) {
                    // place the cursor within the parentheses
                    return {
                        text,
                        selection: [text.length - 1, text.length - 1]
                    }
                }
                return;
            }

            switch (text) {
                case "%":
                    Completer.onlyMacros = true;
                    this.startAutocomplete(editor);
                    break;
                case "=":
                    let position = editor.getCursorPosition();
                    let iterator = new TokenIterator(session, position.row, position.column);
                    let token = iterator.getCurrentToken();
                    if (token.value.startsWith('@')) {
                        this.startAutocomplete(editor);
                        return {
                            text: '=""',
                            selection: [2, 2]
                        }
                    }
                    break;
                case "@":
                    Completer.onlyAttributes = true;
                    this.startAutocomplete(editor);
                    break;
            }
        });
    }

    private startAutocomplete(editor: ace.Editor) {
        setTimeout(() => {
            editor.execCommand('startAutocomplete');
        }, 100);
    }
}

interface AceBehaviour {
    new(): {
        add(name: string, action: string, callback: (state: string[],
            action: string,
            editor: ace.Editor,
            session: ace.IEditSession,
            text: string) => AceHandlerResult): void;
        addBehaviours(behaviours: { [name: string]: AceBehaviour }): void;
        inherit(mode: AceBehaviour, filter: string[]): void;
        remove(name: string): void;
    }
}

type AceHandlerResult = { text: string, selection: number[] | void } | void;
type TokenInfoWithType = {
    type: string | void
} & ace.TokenInfo;
