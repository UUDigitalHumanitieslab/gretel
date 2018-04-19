export declare class XPathExtractinator {
    private parser;
    constructor();
    /**
     * Extract a variable for each node matched by the query.
     * @param xPath Query to analyse.
     * @throws {XPathModels.ParseError} The provided query is malformed.
     * @throws {FormatError} The provided query is in an unexpected format.
     */
    extract(xPath: string): PathVariable[];
    private extractRecursively(parentName, children, nameGenerator);
}
export declare class FormatError {
    type: 'path_start' | 'operation_type' | 'axis_type';
    details: string[];
    constructor(type: 'path_start' | 'operation_type' | 'axis_type', details?: string[]);
    readonly message: string;
}
export interface PathVariable {
    name: string;
    path: string;
}
