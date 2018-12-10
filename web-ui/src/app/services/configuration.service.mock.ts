import { ConfigurationService } from './configuration.service';

/**
 * These are all the public properties of the ConfigurationService
 */
type ConfigurationServiceInterface = {
    [K in keyof ConfigurationService]: ConfigurationService[K]
};

export class ConfigurationServiceMock implements ConfigurationServiceInterface {
    async getApiUrl(path: string): Promise<string> {
        return '/gretel/api/src/router.php/' + path;
    }

    async getGretelUrl(path: string): Promise<string> {
        return '/gretel/' + path;
    }

    async getUploadApiUrl(path: string): Promise<string> {
        return '/gretel-upload/index.php/api/' + path;
    }
}
