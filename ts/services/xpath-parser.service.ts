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

    public parse(xpath: string) {
        let expression: XPathModels.XPathExpression | null;
        let error: ParseError | null;
        if (!xpath) {
            return { expression: null, error: null };
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
            expression, error
        }
    }
}

export interface ParsedXPath {
    expression: XPathModels.XPathExpression | null,
    error: ParseError | null
}

export interface ParseError {
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
