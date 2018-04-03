import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Macro } from './macro';

/**
 * The macro service is used to replace macro variables in the XPATH with the macro value.
 * This is done using the same syntax as used by PaQU e.g. `%PQ_example%`. 
 */
@Injectable()
export class MacroService extends Macro {
    constructor(private httpClient: HttpClient) {
        super();
    }

    /**
     * Loads the macro definitions from a URL.
     * @param url The URL of the macro definitions
     */
    public async loadFromUrl(url: string) {
        let data = await this.httpClient.get(url, { responseType: 'text' }).toPromise();
        this.loadFromText(data);
        return;
    }
}
