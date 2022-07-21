import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "./configuration.service";

export interface MweCanonicalForm {
    id: number,
    text: string
}

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
export class MweService {
    canonicalMweUrl: Promise<string>;
    generateMweUrl: Promise<string>;

    constructor(configurationService: ConfigurationService, private http: HttpClient) {
        this.canonicalMweUrl = configurationService.getMweUrl('canonical');
        this.generateMweUrl = configurationService.getMweUrl('generate');
    }

    async getCanonical() : Promise<MweCanonicalForm[]> {
        return this.http.get<MweCanonicalForm[]>(await this.canonicalMweUrl).toPromise();
    }

    /** Retrieve a query set for a given expression */
    async generateQuery(canonical: string) : Promise<MweQuerySet> {
        let response = await this.http.post<[MweQuery]>(
            await this.generateMweUrl, {canonical}).toPromise();

        let out = new MweQuerySet;
        response.forEach((query) => {
            out.add(query.description, query.xpath);
        });
        return out;
    }
}
