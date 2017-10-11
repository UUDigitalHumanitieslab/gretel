import 'brace/mode/xquery';
import * as ace from 'brace';
import { XpathAttributes } from './xpath-attributes';
import { MacroService } from './services/macro-service';

let TokenIterator: { new(session: ace.IEditSession, initialRow: number, initialColumn: number): ace.TokenIterator } = ace.acequire("ace/token_iterator").TokenIterator;
let XQueryMode: { new(): any } = ace.acequire('ace/mode/xquery').Mode;
let CstyleBehaviour: AceBehaviour = ace.acequire('ace/mode/behaviour/cstyle').CstyleBehaviour;
let XQueryBehaviour: AceBehaviour = ace.acequire('ace/mode/behaviour/xquery').XQueryBehaviour;

let macroService = new MacroService();

export const modeName = 'xpath';
export default class XPathMode extends XQueryMode {
    constructor() {
        super();
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

    static functionCompletions: { [name: string]: { meta: string, hasArguments: boolean } } = {
        'fn:replace()': { meta: 'Replace', hasArguments: true },
        'not()': { meta: 'Negation', hasArguments: true },
        'position()': { meta: 'Position of node', hasArguments: false },
        'last()': { meta: 'Last node position', hasArguments: false },
        'number()': { meta: 'Parse number', hasArguments: true },
    };

    private allCompletions = Object.keys(Completer.functionCompletions).map(func => {
        return { value: func, meta: Completer.functionCompletions[func].meta, score: 500 };
    }).concat([
        { value: 'node', meta: '', score: 500 },
        { value: 'and', meta: '', score: 500 },
        { value: 'or', meta: '', score: 500 },
        { value: "ancestor-or-self::", meta: '', score: 500 },
        { value: "ancestor::", meta: '', score: 500 },
        { value: "child::", meta: '', score: 500 },
        { value: "descendant-or-self::", meta: '', score: 500 },
        { value: "descendant::", meta: '', score: 500 },
        { value: "following-sibling::", meta: '', score: 500 },
        { value: "following::", meta: '', score: 500 },
        { value: "parent::", meta: '', score: 500 },
        { value: "preceding-sibling::", meta: '', score: 500 },
        { value: "preceding::", meta: '', score: 500 },
        { value: "self::", meta: '', score: 500 },
        { value: 'following-sibling::', meta: '', score: 500 }].concat(this.attributesCompletions.map(completion => {
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

    private getAttributeCompletions(iterator: ace.TokenIterator) {
        let token = iterator.getCurrentToken() as TokenInfoWithType;
        if (token.type && token.type == "string") {
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

        if (token.value && token.value.startsWith('@')) {
            // reopened attribute autocomplete
            Completer.onlyAttributes = true;
        }

        return false;
    }

    private getMacroCompletions() {
        let macroCompletions: { value: string, meta: string, score: number }[];
        if (Completer.onlyMacros || !Completer.onlyAttributes) {
            let macroLookup = macroService.getMacros();
            macroCompletions = Object.keys(macroLookup).map(macro => {
                return {
                    value: `${!Completer.onlyMacros ? '%' : ''}${macro}%`,
                    meta: macroLookup[macro].trim().replace(/\s\s+/g, ' '),
                    score: 500
                }
            });
        }

        return macroCompletions;
    }

    public getCompletions(editor: ace.Editor,
        session: ace.IEditSession,
        position: { column: number, row: number },
        prefix: string,
        callback: (error: string | null, data: { value: string, score: number, meta: string }[]) => void) {
        let iterator = new TokenIterator(session, position.row, position.column);
        let attributeCompletions = this.getAttributeCompletions(iterator);
        if (attributeCompletions) {
            callback(null, attributeCompletions);
            return;
        }

        let macroCompletions = this.getMacroCompletions();

        if (Completer.onlyMacros) {
            callback(null, macroCompletions);
            Completer.onlyMacros = false;
        }
        if (Completer.onlyAttributes) {
            callback(null, this.attributesCompletions.concat([]));
            Completer.onlyAttributes = false;
        } else {
            callback(null, this.allCompletions.concat(macroCompletions));
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
                let func = Completer.functionCompletions[text];
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
