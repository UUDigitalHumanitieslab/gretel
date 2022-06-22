import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "./configuration.service";

@Injectable({
    providedIn: 'root'
})
export class MweCanonicalService {
    canonicalMweUrl: Promise<string>;

    constructor(configurationService: ConfigurationService, private http: HttpClient) {
        this.canonicalMweUrl = configurationService.getAlpinoUrl('mwe/canonical');
    }

    async get() : Promise<string[]> {
        return this.http.get<string[]>(await this.canonicalMweUrl).toPromise();
    }
}
