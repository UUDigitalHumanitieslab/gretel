import { ConfigurationService } from './configuration.service';

/**
 * These are all the public properties of the ConfigurationService
 */
type ConfigurationServiceInterface = {
    [K in keyof ConfigurationService]: ConfigurationService[K]
};

export class ConfigurationServiceMock implements ConfigurationServiceInterface {
    public async getApiUrl(provider: string, path: string, parts?: string[], queryString?: {[key: string]: string}): Promise<string> {
        return '/gretel/api/src/router.php/' + path;
    }

    public async getUploadApiUrl(path: string): Promise<string> {
        return '/gretel-upload/index.php/api/' + path;
    }

    public async getUploadProvider(): Promise<string> {
        return 'test-provider';
    }

    public async getAlpinoUrl(): Promise<string> {
        return '';
    }

    public async getProviders(): Promise<string[]> {
        return ['test-provider'];
    }
}
