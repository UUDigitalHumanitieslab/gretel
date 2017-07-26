export module XPathModels {
    export function debugLog(...args: string[]) {
        console.debug(args.join(', '));
    }

    export function validateAxisName(name: string) {
        return name in XPathAxisEnum;
    }

    export enum XPathInitialContextEnum {
        HASHTAG = "hashtag",
        ROOT = "abs",
        RELATIVE = "rel",
        EXPR = "expr"
    };

    export enum XPathAxisEnum {
        CHILD = "child",
        DESCENDANT = "descendant",
        PARENT = "parent",
        ANCESTOR = "ancestor",
        FOLLOWING_SIBLING = "following-sibling",
        PRECEDING_SIBLING = "preceding-sibling",
        FOLLOWING = "following",
        PRECEDING = "preceding",
        ATTRIBUTE = "attribute",
        NAMESPACE = "namespace",
        SELF = "self",
        DESCENDANT_OR_SELF = "descendant-or-self",
        ANCESTOR_OR_SELF = "ancestor-or-self"
    };

    export enum XPathTestEnum {
        NAME = "name",
        NAME_WILDCARD = "*",
        NAMESPACE_WILDCARD = ":*",
        TYPE_NODE = "node()",
        TYPE_TEXT = "text()",
        TYPE_COMMENT = "comment()",
        TYPE_PROCESSING_INSTRUCTION = "processing-instruction"
    }

    export type XPathExpression = XPathBaseExpression | XPathOperation | XPathPathExpr | XPathFilterExpr /* TODO: | XPathHashtagFilter */;
    export type XPathBaseExpression = //{ parens: boolean, expr: XPathExpression } /* TODO: correct? */
        | XPathFuncExpr
        | XPathVariableReference
        | XPathLiteral;

    export class XPathVariableReference {
        type: 'variable';
        constructor(public value: string) {
        }
    }

    export type XPathOperation = XPathBoolExpr | XPathEqExpr | XPathCmpExpr | XPathArithExpr | XPathUnionExpr | XPathNumNegExpr;
    abstract class XPathOperationBase<T> {
        type: 'operation'
        operationType: T;
    }

    abstract class XPathOperator<T> extends XPathOperationBase<T> {
        operationType: T;
        constructor(public properties: { type: T, left: XPathExpression, right: XPathExpression }) {
            super();
            this.operationType = properties.type;
        }
    }

    export class XPathBoolExpr extends XPathOperator<"or" | "and"> { }
    export class XPathEqExpr extends XPathOperator<'==' | '!='> { }
    export class XPathCmpExpr extends XPathOperator<'<' | '<=' | '>' | '>='> { }
    export class XPathArithExpr extends XPathOperator<'+' | '-' | '*' | '/' | '%'> { }
    export class XPathUnionExpr extends XPathOperator<'union'> { }

    export class XPathNumNegExpr extends XPathOperationBase<'num-neg'> {
        operationType: 'num-neg';
        constructor(public properties: { type: 'num-neg', value: XPathExpression }) {
            super();
            this.operationType = properties.type;
        }
    }

    /**
     * Functional call expression.
     */
    export class XPathFuncExpr extends XPathExpression {
        type: 'function' = 'function';
        constructor(public properties: { id: string, args: XPathExpression[] }) {
            super();
        }
    }

    export class XPathPathExpr {
        type: 'path' = 'path';
        constructor(public properties: {
            initial_context: XPathInitialContextEnum,
            filter: XPathFilterExpr,
            steps: XPathStep[]
        }) {
        }
    }

    export class XPathStep {
        type: 'path-step' = 'path-step';
        constructor(public properties: {
            axis: XPathAxisEnum,
            test: XPathTestEnum
        }) {
        }
    }

    export class XPathFilterExpr {
        type: 'filter' = 'filter';
        constructor(public properties: {
            expr, predicates
        }) {
        }
    }

    /*
     * Literals
     */
    type XPathLiteral = XPathStringLiteral | XPathNumericLiteral;
    export class XPathStringLiteral {
        type: 'string' = 'string';
        constructor(public value: string) {
        }
    }

    export class XPathNumericLiteral {
        type: 'numeric' = 'numeric';
        constructor(public value: number) {
        }
    }
}
