import { Injectable } from '@angular/core';

import { Parser } from 'xml2js';
import { ExtractinatorService, PathVariable } from 'lassy-xpath/ng';

@Injectable()
export class ParseService {
    private parser = new Parser();

    constructor(private extractinatorService: ExtractinatorService) {
    }

    parseXml(xml: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.parser.parseString(xml, (error?: Error, data?: any) => {
                if (error) {
                    return reject(error);
                }
                return resolve(data);
            });
        });
    }

    extractVariables(xpath: string) {
        let variables: PathVariable[];
        try {
            variables = this.extractinatorService.extract(xpath);
        } catch (e) {
            variables = [];
            console.warn('Error extracting variables from path', e, xpath);
        }

        return {
            variables,
            lookup: variables.reduce<{ [name: string]: PathVariable }>(
                (vs, v) => { vs[v.name] = v; return vs; }, {})
        };
    }
}
