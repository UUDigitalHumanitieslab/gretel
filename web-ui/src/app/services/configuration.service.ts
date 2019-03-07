import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigurationService {
    private config: Promise<Config>;

    constructor(private httpClient: HttpClient) {
        this.config = this.loadConfig();
    }

    async getApiUrl(provider: string, path: string, parts: string[] = [], queryString: { [key: string]: string } = {}): Promise<string> {
        const queryStringEntries = Object.entries(queryString);
        return (await this.config).providers[provider] + path +
            (parts.length ? '/' + parts.join('/') : '') +
            (queryStringEntries.length
                ? queryStringEntries.map(([key, value], index) => `${index ? '&' : '?'}${key}=${value}`)
                : '');
    }

    async getUploadApiUrl(path: string) {
        return (await this.config).uploadUrl + path;
    }

    async getUploadProvider() {
        return (await this.config).uploadProvider;
    }

    async getAlpinoUrl(path: string) {
        return (await this.config).alpino + path;
    }

    async getProviders() {
        return Object.keys((await this.config).providers);
    }

    private async loadConfig() {
        return this.httpClient.get<Config>(`assets/config/config.${environment.name}.json`).toPromise();
    }
}

interface Config {
    providers: {
        [key: string]: string
    },
    // TODO implement this functionality clientside
    /**
     * Alpino endpoint.
     * This should not be the raw alpino in server-mode, but should implement as according to gretel4/api/router.php
     */
    alpino: string,
    /** Uploading is not federated and only supports a single endpoint */
    uploadUrl: string;
    /** Uploading requires a provider to request results */
    uploadProvider: string;
}
