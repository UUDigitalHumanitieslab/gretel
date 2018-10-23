import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ParserService } from 'lassy-xpath/ng';
import { ConfigurationService } from "./configuration.service";

@Injectable()
export class AlpinoService {
    generateXPathUrl: Promise<string>;

    constructor(private configurationService: ConfigurationService, private http: HttpClient, private parserService: ParserService) {
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

    async parseSentenceUrl(sentence: string) {
        return this.configurationService.getApiUrl('parse_sentence/' + this.escapeSlash(this.tokenize(sentence)));
    }

    async parseSentence(sentence: string) {
        return this.http.get(
            await this.parseSentenceUrl(sentence),
            { responseType: 'text' }).toPromise();
    }

    tokenize(sentence: string) {
        // Add space before and after punctuation marks
        return sentence.replace(/([<>\.\,\:\;\?!\(\)\"\\\/])/g, ' $1 ')
            // Deal wth ...
            .replace(/(\.\s+\.\s+\.)/g, ' ... ')
            // Delete first and last space(s)
            .replace(/^\s*(.*?)\s*$/g, '$1')
            // Change multiple spaces to single space
            .replace(/\s+/g, ' ');
    }

    /**
     * The slash is decoded before the router parses the address,
     * mayhem ensues.
     * So it needs to be escaped in some magic way.
     * @param sentence
     */
    escapeSlash(sentence: string) {
        return encodeURIComponent(sentence.replace(/\//g, '_SLASH_'));
    }
}
