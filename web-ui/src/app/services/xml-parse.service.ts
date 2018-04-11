import { Injectable } from '@angular/core';

import { Parser } from 'xml2js';

@Injectable()
export class XmlParseService {
    private parser = new Parser();

    parse(xml: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.parser.parseString(xml, (error, data) => {
                if (error) {
                    return reject(error);
                }
                return resolve(data);
            })
        });
    }
}
