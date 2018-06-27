import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ParserService } from 'lassy-xpath/ng';
import { ConfigurationService } from "./configuration.service";

@Injectable()
export class AlpinoService {
    parseSentenceUrl: Promise<string>;
    generateXPathUrl: Promise<string>;

    constructor(configurationService: ConfigurationService, private http: HttpClient, private parserService: ParserService) {
        this.parseSentenceUrl = configurationService.getApiUrl('parse_sentence');
        this.generateXPathUrl = configurationService.getApiUrl('generate_xpath');
    }

    async generateXPath(xml: string, tokens: string[], attributes: string[], ignoreTopNode: boolean, respectOrder: boolean) {
        let result = await this.http.post<{
            xpath: string,
            subTree: string
        }>(await this.generateXPathUrl, {
            xml,
            tokens,
            attributes,
            ignoreTopNode,
            respectOrder
        }).toPromise();

        return {
            xpath: this.parserService.format(result.xpath),
            subTree: result.subTree
        }
    }

    async parseSentence(sentence: string) {
        return this.http.post(await this.parseSentenceUrl, this.tokenize(sentence), { responseType: 'text' }).toPromise();
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
