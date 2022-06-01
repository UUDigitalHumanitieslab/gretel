import { Injectable } from '@angular/core';

interface MWEQuery {
    /** User-facing description of the query */
    description: string;
    xpath: string;
}

export class MWEQuerySet {
    queries: MWEQuery[];

    constructor(queries: MWEQuery[] = []) {
        this.queries = queries;
    }

    add(description: string, xpath: string) {
        this.queries.push({description, xpath});
    }
}

@Injectable({
    providedIn: 'root'
})
/** Service to talk to the backend query generation component */
export class MWEQueryMakerService {

    constructor() { }

    /** Retrieve a query set for a given expression */
    translate(expression: string) : MWEQuerySet {
        let result = new MWEQuerySet;
        result.add('Everything', '//node');
        result.add('Near-Miss (still everything)', '//node');
        result.add('Superset (still everything)', '//node');
        return result;
    }
}
