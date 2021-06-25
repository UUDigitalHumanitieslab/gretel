import { Injectable } from '@angular/core';

import * as parser from 'fast-xml-parser';
import { ExtractinatorService, PathVariable } from 'lassy-xpath';

@Injectable()
export class ParseService {
    constructor(private extractinatorService: ExtractinatorService) {
    }

    parseXml(xml: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            try {
                const data = parser.parse(xml,
                    {
                        arrayMode: true,
                        attrNodeName: '$',
                        attributeNamePrefix: '',
                        ignoreAttributes: false,
                        parseAttributeValue: true
                    });
                return resolve(data);
            } catch (exception) {
                return reject(exception);
            }
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
