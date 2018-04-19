export declare type CreateJQueryXPathEditor = (options: {
    macrosUrl: string;
}) => JQuery;
declare global  {
    interface JQuery {
        xpathEditor: CreateJQueryXPathEditor;
    }
}
