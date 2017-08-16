declare module "ace/ace" {
    export = ace;
}

declare module "ace/range" {
    export class Range extends AceAjax.Range {
        constructor(startRow: number, startColumn: number, endRow: number, endColumn: number);
    }
} 