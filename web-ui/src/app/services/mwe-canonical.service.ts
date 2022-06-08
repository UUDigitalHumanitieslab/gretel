import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfigurationService } from "./configuration.service";

@Injectable({
    providedIn: 'root'
})
export class MWECanonicalService {
    canonicalMWEUrl: Promise<string>;

    constructor(configurationService: ConfigurationService, private http: HttpClient) {
        this.canonicalMWEUrl = configurationService.getAlpinoUrl('mwe/canonical');
    }

    async get() : Promise<string[]> {
        return this.http.get<string[]>(await this.canonicalMWEUrl).toPromise();
    }
}
