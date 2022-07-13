import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "./configuration.service";

export interface MweQuery {
    /** User-facing description of the query */
    description: string;
    xpath: string;
}

export class MweQuerySet {
    queries: MweQuery[];

    constructor(queries: MweQuery[] = []) {
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
export class MweQueryMakerService {
    generateMweUrl: Promise<string>;

    constructor(private configurationService: ConfigurationService, private http: HttpClient) {
        this.generateMweUrl = configurationService.getMweUrl('generate');
    }

    /** Retrieve a query set for a given expression */
    async translate(canonical: string) : Promise<MweQuerySet> {
        let response = await this.http.post<[MweQuery]>(
            await this.generateMweUrl, {canonical}).toPromise();

        let out = new MweQuerySet;
        response.forEach((query) => {
            out.add(query.description, query.xpath);
        });
        return out;
    }
}
