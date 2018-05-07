import { ConfigurationService } from "./_index";

export class ConfigurationServiceMock implements ConfigurationService {
    getBaseUrlGretel(): string {
        return '/';
    }
}
