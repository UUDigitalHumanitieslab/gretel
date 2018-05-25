import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import * as rxjs from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from "./configuration.service";

@Injectable()
export class AlpinoService {
    parseSentenceUrl: string;
    generateXPathUrl: string;

    constructor(private http: HttpClient) {
        this.parseSentenceUrl = '/gretel/api/src/router.php/parse_sentence';
        this.generateXPathUrl = '/gretel/api/src/router.php/generate_xpath';
    }

    async generateXPath(xml: string, tokens: string[], attributes: string[], removeTopCat: boolean, order: boolean) {
        return this.http.post<{
            xpath: string,
            subTree: string
        }>(this.generateXPathUrl, {
            xml,
            tokens,
            attributes,
            removeTopCat,
            order
        }).toPromise();
    }

    async parseSentence(sentence: string) {
        return this.http.post(this.parseSentenceUrl, this.tokenize(sentence), { responseType: 'text' }).toPromise();
    }

    tokenize(sentence: string) {
        // Add space before and after punctuation marks
        return sentence.replace(/([<>\.\,\:\;\?!\(\)\"])/g, ' $1 ')
            // Deal wth ...
            .replace(/(\.\s+\.\s+\.)/g, ' ... ')
            // Delete first and last space(s)
            .replace(/^\s*(.*?)\s*$/g, '$1')
            // Change multiple spaces to single space
            .replace(/\s+/g, ' ');
    }
}
