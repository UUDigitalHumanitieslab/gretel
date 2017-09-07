import * as parser from '../parser/xpath';
import { XPathModels } from '../parser/xpath-models';

export default class XPathParserService {
    constructor() {
        // assign the shared scope
        (parser as any).yy = {
            xpathModels: XPathModels,
            parseError: XPathModels.parseError
        };
        // this can be useful to figure out what's wrong
        // XPathModels.isDebugging = true;
    }

    public parse(xpath: string): ParsedXPath {
        let expression: XPathModels.XPathExpression | null;
        let error: ParseMessage | null;
        if (!xpath) {
            return { expression: null, warnings: [], error: null };
        }
        try {
            expression = parser.parse(xpath);
            error = null;
        } catch (exception) {
            if (exception instanceof XPathModels.ParseError) {
                expression = null;
                error = {
                    length: exception.hash.token ? exception.hash.token.length : undefined,
                    line: exception.hash.line,
                    message: exception.message,
                    offset: exception.hash.loc ? exception.hash.loc.first_column : undefined
                };
            } else {
                throw error;
            }
        }

        return {
            expression,
            // TODO: actually give warnings!
            warnings: [],
            error
        }
    }

    private getWarnings(expression: XPathModels.XPathExpression) {
    }
}

export interface ParsedXPath {
    expression: XPathModels.XPathExpression | null,
    error: ParseMessage | null,
    warnings: ParseMessage[]
}

export interface ParseMessage {
    /**
     * Zero-based character offset
     */
    offset: number,
    length: number | undefined,
    /**
     * Zero-based line number
     */
    line: number,
    message: string
}