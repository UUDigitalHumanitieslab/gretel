import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "./configuration.service";

export interface MWEQuery {
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
    generateMWEUrl: Promise<string>;

    constructor(private configurationService: ConfigurationService, private http: HttpClient) {
        this.generateMWEUrl = configurationService.getAlpinoUrl('mwe/generate');
    }

    /** Retrieve a query set for a given expression */
    async translate(canonical: string) : Promise<MWEQuerySet> {
        let response = await this.http.post<[MWEQuery]>(
            await this.generateMWEUrl, {canonical}).toPromise();

        let out = new MWEQuerySet;
        response.forEach((query) => {
            out.add(query.description, query.xpath);
        });
        return out;
    }
}
