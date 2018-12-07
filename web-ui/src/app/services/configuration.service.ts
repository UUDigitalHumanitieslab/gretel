import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigurationService {
    private config: Promise<Config>;

    constructor(private httpClient: HttpClient) {
        this.config = this.loadConfig();
    }

    async getApiUrl(path: string, parts: string[] = [], queryString: { [key: string]: string } = {}): Promise<string> {
        const queryStringEntries = Object.entries(queryString);
        return (await this.config).apiUrl + path +
            (parts.length ? '/' + parts.join('/') : '') +
            (queryStringEntries.length
                ? queryStringEntries.map(([key, value], index) => `${index ? '&' : '?'}${key}=${value}`)
                : '');
    }

    async getGretelUrl(path: string): Promise<string> {
        return (await this.config).gretelUrl + path;
    }

    async getUploadApiUrl(path: string): Promise<string> {
        return (await this.config).uploadUrl + path;
    }

    private async loadConfig() {
        return this.httpClient.get<Config>(`assets/config/config.${environment.name}.json`).toPromise();
    }
}

interface Config {
    'apiUrl': string;
    'gretelUrl': string;
    'uploadUrl': string;
}
