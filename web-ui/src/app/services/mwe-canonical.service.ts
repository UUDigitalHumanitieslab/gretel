import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "./configuration.service";

export interface MweCanonicalForm {
    id: number,
    text: string
}

@Injectable({
    providedIn: 'root'
})
export class MweCanonicalService {
    canonicalMweUrl: Promise<string>;

    constructor(configurationService: ConfigurationService, private http: HttpClient) {
        this.canonicalMweUrl = configurationService.getMweUrl('canonical');
    }

    async get() : Promise<MweCanonicalForm[]> {
        return this.http.get<MweCanonicalForm[]>(await this.canonicalMweUrl).toPromise();
    }
}
