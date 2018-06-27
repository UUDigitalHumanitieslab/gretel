import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigurationService {
    private config: Promise<Config>;

    constructor(private httpClient: HttpClient) {
        this.config = this.loadConfig();
    }

    async getApiUrl(path: string): Promise<string> {
        return (await this.config).apiUrl + path;
    }

    async getGretelUrl(path: string): Promise<string> {
        return (await this.config).gretelUrl + path;
    }

    async getUploadApiUrl(path: string): Promise<string> {
        return (await this.config).uploadUrl + path;
    }

    async loadConfig() {
        return this.httpClient.get<Config>(`assets/config/config.${environment.name}.json`).toPromise();
    }
}

interface Config {
    "apiUrl": string
    "gretelUrl": string
    "uploadUrl": string
}
