import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "./configuration.service";

export interface MweCanonicalForm {
    id: number,
    text: string
}

export interface MweQuery {
    id?: number;

    /** User-facing description of the query */
    description: string;
    xpath: string;
    rank: number;

    /** id of relevant canonical form */
    canonical: number;
}

export type MweQuerySet = MweQuery[];

@Injectable({
    providedIn: 'root'
})
export class MweService {
    canonicalMweUrl: Promise<string>;
    generateMweUrl: Promise<string>;
    saveQueryUrl: Promise<string>;

    constructor(configurationService: ConfigurationService, private http: HttpClient) {
        this.canonicalMweUrl = configurationService.getMweUrl('canonical');
        this.generateMweUrl = configurationService.getMweUrl('generate');
        this.saveQueryUrl = configurationService.getMweUrl('xpath/');
    }

    async getCanonical() : Promise<MweCanonicalForm[]> {
        return this.http.get<MweCanonicalForm[]>(await this.canonicalMweUrl).toPromise();
    }

    /** Retrieve a query set for a given expression */
    async generateQuery(canonical: string) : Promise<MweQuerySet> {
        let response = await this.http.post<MweQuerySet>(
            await this.generateMweUrl, {canonical}).toPromise();

        return response;
    }

    async saveCustomQuery(query: MweQuery) : Promise<MweQuery> {
        if (query.id) {
            return this.http.put<MweQuery>(await this.saveQueryUrl + query.id + '/', query).toPromise();
        }
        return this.http.post<MweQuery>(await this.saveQueryUrl, query).toPromise();
    }
}
