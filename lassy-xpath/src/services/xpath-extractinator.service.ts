import { Injectable } from '@angular/core';
import { XPathExtractinator } from './xpath-extractinator';

@Injectable()
export class XPathExtractinatorService extends XPathExtractinator {
    constructor() {
        super();
    }
}
