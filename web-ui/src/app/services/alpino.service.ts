import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ParserService } from 'lassy-xpath';
import { ConfigurationService } from "./configuration.service";
import { DefaultTokenAttributes } from '../pages/multi-step-page/steps';

@Injectable()
export class AlpinoService {
    generateXPathUrl: Promise<string>;

    constructor(private configurationService: ConfigurationService, private http: HttpClient, private parserService: ParserService) {
        this.generateXPathUrl = configurationService.getAlpinoUrl('generate_xpath');
    }

    async generateXPath(xml: string, tokens: string[], attributes: TokenAttributes[], ignoreTopNode: boolean, respectOrder: boolean) {
        const result = await this.http.post<{
            xpath: string,
            subTree: string
        }>(await this.generateXPathUrl, {
            xml,
            tokens,
            attributes: this.attributesToStrings(attributes),
            ignoreTopNode,
            respectOrder
        }).toPromise();

        return {
            xpath: this.parserService.format(result.xpath),
            subTree: result.subTree
        };
    }

    async parseSentenceUrl(sentence: string) {
        return this.configurationService.getAlpinoUrl('parse_sentence/' + this.escapeSlash(this.tokenize(sentence)));
    }

    async parseSentence(sentence: string) {
        return this.http.get(
            await this.parseSentenceUrl(sentence),
            { responseType: 'text' }).toPromise();
    }

    attributesToStrings(attrs: TokenAttributes[]): string[] {
        if (attrs === undefined) {
            return undefined;
        }

        return attrs.map(attr => {
            let parts: string[] = [];

            for (let key of ['na', 'cs']) {
                if (attr[key] !== DefaultTokenAttributes[key]) {
                    // this token is ignored - don't parse the remaining tokens
                    if (key === 'na') {
                        return 'na';
                    }
                    parts.push(key);
                }
            }

            for (let key of ['rel', 'token', 'lemma', 'pos', 'postag']) {
                switch (attr[key]) {
                    case DefaultTokenAttributes[key]:
                        // don't set default values
                        break;

                    case 'include':
                        parts.push(key);
                        break;

                    case 'exclude':
                        parts.push(`-${key}`);
                        break;

                    default:
                        break;
                }
            }

            return parts.join(',');
        });
    }

    attributesFromString(strings: string[]): TokenAttributes[] {
        if (strings === undefined) {
            return undefined;
        }

        return strings.map(string => {
            let parts: string[] = string.split(',');
            let attributes: TokenAttributes = {
                ...DefaultTokenAttributes
            };

            for (let part of parts) {
                const key = part.replace(/^-/, '');
                switch (key) {
                    case 'cs':
                    case 'na':
                        attributes[key] = true;
                        break;

                    case 'rel':
                    case 'token':
                    case 'lemma':
                    case 'pos':
                    case 'postag':
                        attributes[key] = part[0] === '-' ? 'exclude' : 'include';
                        break;
                }
            }

            return attributes;
        });
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

export type DefaultValue = 'include' | 'exclude' | undefined;

export interface TokenAttributes {
    rel?: DefaultValue,
    token?: DefaultValue,
    lemma?: DefaultValue,
    pos?: DefaultValue,
    cs?: boolean,
    postag?: DefaultValue,
    na?: boolean
}

export type AttributeType = keyof TokenAttributes;
