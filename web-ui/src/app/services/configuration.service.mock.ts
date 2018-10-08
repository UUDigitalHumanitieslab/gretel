export class ConfigurationServiceMock {
    async getApiUrl(path: string): Promise<string> {
        return "/gretel/api/src/router.php/" + path;
    }

    async getGretelUrl(path: string): Promise<string> {
        return "/gretel/" + path;
    }

    async getUploadApiUrl(path: string): Promise<string> {
        return "/gretel-upload/index.php/api/" + path;
    }
}
