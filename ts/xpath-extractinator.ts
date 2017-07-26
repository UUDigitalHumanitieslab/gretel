import * as parser from './parser/xpath';
import { XPathModels } from './xpath-models';

export class XPathExtractinator {
    constructor() {
        // assign the shared scope
        (parser as any).yy = { xpathModels: XPathModels };
    }

    extract(xPath: string): PathVariable[] {
        let parsed = parser.parse(xPath);
        if (parsed.type == 'path') {
            // assume it starts with //node                       
            // ???
        }
        
        console.log(parsed);
        // if (parsed.type == 'function') {
        //     var firstArg = parsed.properties.args[0];
        //     if (firstArg.type == 'variable') {
        //         firstArg.value
        //     }

        // }
        return [];
    }

    private findNodes(nameGenerator: () => string, expression: XPathModels.XPathExpression) {
        
    }
}

export interface PathVariable {
    name: string,
    path: string
}
