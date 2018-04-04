import { Inject, Injectable } from '@angular/core';
import { Macro } from './macro';

/**
 * The macro service is used to replace macro variables in the XPATH with the macro value.
 * This is done using the same syntax as used by PaQU e.g. `%PQ_example%`. 
 */
@Injectable()
export class MacroService extends Macro {
    constructor() {
        super();
    }
}
