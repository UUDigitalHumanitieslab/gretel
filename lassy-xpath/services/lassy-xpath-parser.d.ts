import { XPathModels } from 'ts-xpath';
export declare class LassyXPathParser {
    private parser;
    constructor();
    parse(xpath: string): ParsedXPath;
    private createWarning(message, location, offset?);
    private getWarnings(expressions);
    private getOperationWarnings(expression);
    private getPathWarnings(expression);
}
export interface ParsedXPath {
    expression: XPathModels.XPathExpression | null;
    error: ParseMessage | null;
    warnings: ParseMessage[];
}
export interface ParseMessage {
    /**
     * Zero-based character offset
     */
    startColumn: number | undefined;
    /**
     * Zero-based last column, exclusive.
     */
    lastColumn: number | undefined;
    /**
     * Zero-based line number
     */
    startLine: number;
    /**
     * Zero-based last line number, inclusive.
     */
    lastLine: number;
    message: string;
}
