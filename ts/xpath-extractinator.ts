import * as parser from './parser/xpath';
import { XPathModels } from './parser/xpath-models';


export class XPathExtractinator {
    constructor() {
        // assign the shared scope
        (parser as any).yy = {
            xpathModels: XPathModels,
            parseError: XPathModels.parseError
        };
        // this can be useful to figure out what's wrong
        // XPathModels.isDebugging = true;
    }

    /**
     * Extract a variable for each node matched by the query.
     * @param xPath Query to analyse.
     * @throws {FormatError} The provided query is in an unexpected format.
     */
    extract(xPath: string): PathVariable[] {
        let parsed = parser.parse(xPath);
        // expect any query to at least start with //node
        if (parsed.type == 'path') {
            let children = parsed.getChildren();
            if (children.length != 2) {
                throw new FormatError('path_start');
            }

            let nameGenerator = new NameGenerator();
            let result = this.extractRecursively("$node", children[1].getChildren(), () => nameGenerator.get());
            return result;
        }

        return [];
    }

    private extractRecursively(parentName: string, children: XPathModels.XPathExpression[], nameGenerator: () => string): PathVariable[] {
        let result: PathVariable[] = [];

        for (let child of children) {
            switch (child.type) {
                case "path":
                    // this is a level below the parent e.g. $parent/*
                    let name = nameGenerator();
                    result.push({ name, path: `${parentName}/${child.toXPath()}` });

                    for (let step of child.steps) {
                        if (step.properties.axis == 'child') {
                            result.push(...this.extractRecursively(name, step.predicates, nameGenerator));
                        } else {
                            throw new FormatError('axis_type', [step.properties.axis]);
                        }
                    }

                    break;

                case "operation":
                    // this is an operation at the current level, only interested in possible children
                    // e.g. $parent[* and *]
                    if (child.operationType == "and" || child.operationType == "or" || child.operationType == "union") {
                        result.push(...this.extractRecursively(parentName, child.getChildren(), nameGenerator));
                    }
            }
        }

        return result;
    }
}

export class FormatError extends Error {
    constructor(public type: 'path_start' | 'operation_type' | 'axis_type', public details: string[] = []) {
        super({
            'path_start': 'Unexpected path format! Expected it should start with //node.',
            'operation_type': `Unexpected operation type ${details[0]}.`,
            'axis_type': `Unknown axis type (${details[0]}).`
        }[type]);
    }
}

export interface PathVariable {
    name: string,
    path: string
}

class NameGenerator {
    private index = 1;
    get() {
        return `$node${this.index++}`;
    }
}
