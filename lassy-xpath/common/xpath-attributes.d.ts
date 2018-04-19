export declare type XPathAttribute = {
    description: string;
    /**
     * [value, description][]
     */
    values: [string, string][];
};
export declare let XpathAttributes: {
    [name: string]: XPathAttribute;
};
