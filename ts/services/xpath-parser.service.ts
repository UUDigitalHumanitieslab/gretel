import { XpathAttributes } from '../xpath-attributes';
import { XPathModels, XPathParser } from 'ts-xpath';

const elementNames = ['item', 'meta', 'metadata', 'node', 'parser', 'sentence'];
export class XPathParserService {
    private parser: XPathParser;
    constructor() {
        this.parser = new XPathParser();
    }

    public parse(xpath: string): ParsedXPath {
        let expression: XPathModels.XPathExpression | null;
        let error: ParseMessage | null;
        if (!xpath) {
            return { expression: null, warnings: [], error: null };
        }
        try {
            expression = this.parser.parse(xpath);
            error = null;
        } catch (exception) {
            if (exception instanceof XPathModels.ParseError) {
                expression = null;
                let startColumn = exception.hash.loc ? exception.hash.loc.first_column : undefined
                error = {
                    lastLine: exception.hash.line,
                    lastColumn: startColumn && exception.hash.token ? startColumn + exception.hash.token.length : undefined,
                    startLine: exception.hash.line,
                    startColumn: startColumn,
                    message: exception.message,
                };
            } else {
                throw error;
            }
        }

        return {
            expression,
            warnings: expression ? this.getWarnings([expression]) : [],
            error
        }
    }

    private createWarning(message: string, location: XPathModels.ParseLocation, offset = -1): ParseMessage {
        return {
            startLine: location.firstLine - 1,
            startColumn: location.firstColumn + offset,
            lastColumn: location.lastColumn,
            lastLine: location.lastLine - 1,
            message
        };
    }

    private getWarnings(expressions: XPathModels.XPathExpression[]): ParseMessage[] {
        let warnings: ParseMessage[] = [];
        for (let expression of expressions) {
            if (expression.type == 'path') {
                warnings.push(...this.getPathWarnings(expression));
            } else if (expression.type == 'operation') {
                warnings.push(...this.getOperationWarnings(expression));
            } else if (expression.type == 'function') {
                // check the arguments of a function
                warnings.push(...this.getWarnings(expression.getChildren()));
            }
        }

        return warnings;
    }

    private getOperationWarnings(expression: XPathModels.XPathOperation) {
        let children = expression.getChildren();
        if (expression.operationType == '!=' || expression.operationType == '==') {
            // check the value of an attribute expression (e.g. @rel="hd"")
            let left = children[0],
                right = children[1];

            if (left.type == 'path' &&
                left.steps.length &&
                left.steps[0].properties.axis == 'attribute' &&
                right.type == 'string') {
                // to the left is an attribute path, to the right a string value expression
                let attributeName = left.steps[0].properties.name;
                let attribute = XpathAttributes[attributeName];
                let attributeValue = right.value;
                if (attribute && attribute.values.length && attribute.values.findIndex((val) => val[0] == attributeValue) == -1) {
                    return [this.createWarning(`Unknown attribute value "${attributeValue}"`, right.location, 0)];
                }
            }
        }

        return this.getWarnings(children);
    }

    private getPathWarnings(expression: XPathModels.XPathPathExpr) {
        let warnings: ParseMessage[] = [];
        for (let step of expression.steps) {
            if (step.properties.axis == 'attribute') {
                // check the attribute's name
                if (!XpathAttributes[step.properties.name]) {
                    warnings.push(this.createWarning(`Unknown attribute @${step.properties.name}`, step.properties.location));
                }
            } else if (step.properties.test == 'name') {
                // check the element name
                if (elementNames.indexOf(step.properties.name) == -1) {
                    let warning = this.createWarning(`Unknown element ${step.properties.name}`, step.properties.location, 0);
                    warnings.push(warning);
                }
            }
            warnings.push(...this.getWarnings(step.getChildren()));
        }

        return warnings;
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
    startColumn: number,
    /**
     * Zero-based last column, exclusive.
     */
    lastColumn: number,
    /**
     * Zero-based line number
     */
    startLine: number,
    /**
     * Zero-based last line number, inclusive.
     */
    lastLine: number,
    message: string
}