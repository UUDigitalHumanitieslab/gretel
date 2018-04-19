export declare class XPathVariablesRenderer {
    private view;
    private source;
    private extractinator;
    private subject;
    private variables;
    constructor(element: HTMLElement, source: string | JQuery, formName: string);
    private update();
    private extract(xpath);
}
export declare type CreateXPathVariablesRenderer = (options: {
    source: string | JQuery;
    formName: string;
}) => JQuery;
declare global  {
    interface JQuery {
        xpathVariables: CreateXPathVariablesRenderer;
    }
}
