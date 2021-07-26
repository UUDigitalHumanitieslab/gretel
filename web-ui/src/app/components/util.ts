import { SimpleChange } from "@angular/core";

interface TypedChange<T> extends SimpleChange {
    previousValue: T;
    currentValue: T;
}
export type TypedChanges<T> = {
    [propName in keyof T]: TypedChange<T[propName]>;
};


export interface OnTypedChanges<T> {
    ngOnChanges(changes: TypedChanges<T>): void;
}

export function comparatorGenerator<T>(a: T, b: T, ...propertyExtractors: ((value: T) => any)[]): number {
    for (let extractor of propertyExtractors) {
        const extractedA = extractor(a);
        const extractedB = extractor(b);
        if (extractedA < extractedB) {
            return -1;
        } else if (extractedA > extractedB) {
            return 1;
        }
    }

    return 0;
}
