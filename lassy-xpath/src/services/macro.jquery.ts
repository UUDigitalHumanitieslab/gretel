import * as $ from 'jquery';
import { Macro} from './macro';

/**
 * The macro service is used to replace macro variables in the XPATH with the macro value.
 * This is done using the same syntax as used by PaQU e.g. `%PQ_example%`. 
 */
export class MacroService extends Macro {
    /**
     * Loads the macro definitions from a URL.
     * @param url The URL of the macro definitions
     */
    public loadFromUrl(url: string) {
        return new Promise((resolve, reject) => {
            $.get(url, (data: string) => {
                this.loadFromText(data);
                resolve();
            });
        });
    }
}
