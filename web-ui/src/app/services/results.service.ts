import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Observable } from "rxjs/Observable";

import { XmlParseService } from './xml-parse.service';

import 'rxjs/add/operator/mergeMap'
const routerUrl = '/gretel/api/src/router.php/';
const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    })
};

@Injectable()
export class ResultsService {
    defaultIsAnalysis = false;
    defaultMetadataFilters: { [key: string]: FilterValue } = {};
    defaultVariables: { name: string, path: string }[] = null


    constructor(private http: HttpClient, private sanitizer: DomSanitizer, private xmlParseService: XmlParseService) {
    }

    getAllResults(xpath: string,
        corpus: string,
        components: string[],
        retrieveContext: boolean,
        isAnalysis = this.defaultIsAnalysis,
        metadataFilters = this.defaultMetadataFilters,
        variables = this.defaultVariables): Observable<any> {
        return Observable.create(async observer => {
            let offset = 0;
            while (!observer.closed) {
                await this.results(xpath, corpus, components, offset, retrieveContext, isAnalysis, metadataFilters, variables)
                    .then((res) => {
                        if (res) {
                            observer.next(res);
                            offset = res.nextOffset;
                        } else {
                            observer.complete();
                        }

                    });

            }
        }).mergeMap(results => results.hits);
    }

    /**
     * Queries the treebank and returns the matching hits.
     * @param xpath Specification of the pattern to match
     * @param corpus Identifier of the corpus
     * @param components Identifiers of the sub-treebanks
     * @param offset Zero-based index of the results
     * @param retrieveContext Get the sentence before and after the hit
     * @param isAnalysis Whether this search is done for retrieving analysis results, in that case a higher result limit is used
     * @param metadataFilters The filters to apply for the metadata properties
     * @param variables Named variables to query on the matched hit (can be determined using the Extractinator)
     */
    async results(xpath: string,
        corpus: string,
        components: string[],
        offset: number = 0,
        retrieveContext: boolean,
        isAnalysis = this.defaultIsAnalysis,
        metadataFilters = this.defaultMetadataFilters,
        variables = this.defaultVariables) {
        let results = await this.http.post<ApiSearchResult | false>(routerUrl + 'results', {
            xpath: xpath + this.createMetadataFilterQuery(metadataFilters),
            retrieveContext,
            corpus,
            components,
            offset,
            isAnalysis,
            variables
        }, httpOptions).toPromise();
        if (results) {
            return this.mapResults(results);
        }

        return false;
    }

    async metadataCounts(xpath: string, corpus: string, components: string[], metadataFilters: { [key: string]: FilterValue } = {}) {
        return await this.http.post<{ [key: string]: { [value: string]: number } }>(routerUrl + 'metadata_counts', {
            xpath: xpath + this.createMetadataFilterQuery(metadataFilters),
            corpus,
            components,
        }, httpOptions).toPromise();
    }

    async treebankCounts(xpath: string, corpus: string, components: string[], metadataFilters: { [key: string]: FilterValue } = {}) {
        let results = await this.http.post<{ [databaseId: string]: string }>(routerUrl + 'treebank_counts', {
            xpath: xpath + this.createMetadataFilterQuery(metadataFilters),
            corpus,
            components,
        }, httpOptions).toPromise();

        return Object.keys(results).map(databaseId => {
            return {
                databaseId,
                count: parseInt(results[databaseId])
            } as TreebankCount;
        });
    }

    /**
     * Builds the XQuery metadata filter.
     *
     * @return string The metadata filter
     */
    private createMetadataFilterQuery(filters: { [key: string]: FilterValue }) {
        // Compile the filter
        let filter = '';
        for (let key of Object.keys(filters)) {
            let value = filters[key];

            switch (value.type) {
                case 'single':
                    // Single values
                    filter += `[ancestor::alpino_ds/metadata/meta[@name="${key}" and @value="${value}"]]`;
                    break;
                case 'range':
                    // Ranged values
                    filter += `[ancestor::alpino_ds/metadata/meta[@name="${key}" and @value>="${value.min}" and @value<="${value.max}"]]`;
                    break;
            }
        }

        return filter;
    }

    private async mapResults(results: ApiSearchResult): Promise<SearchResults> {
        return {
            hits: await this.mapHits(results),
            nextOffset: results[7] + 1
        }
    }

    private mapHits(results: ApiSearchResult): Promise<Hit[]> {
        return Promise.all(Object.keys(results[0]).map(async hitId => {
            let sentence = results[0][hitId];
            let nodeStarts = results[3][hitId].split('-').map(x => parseInt(x));
            let metaValues = this.mapMeta(await this.xmlParseService.parse(`<metadata>${results[5][hitId]}</metadata>`));
            let variableValues = this.mapVariables(await this.xmlParseService.parse(results[6][hitId]));
            return {
                fileId: hitId.replace(/-endPos=(\d+|all)\+match=\d+$/, ''),
                component: hitId.replace(/\-.*/, '').toUpperCase(),
                sentence,
                highlightedSentence: this.highlightSentence(sentence, nodeStarts, 'strong'),
                treeXml: results[4][hitId],
                nodeIds: results[2][hitId].split('-').map(x => parseInt(x)),
                nodeStarts,
                metaValues,
                /**
                 * Contains the XML of the node matching the variable
                 */
                variableValues
            };
        }));
    }

    private mapMeta(data: {
        metadata: {
            meta?: {
                $: {
                    type: string,
                    name: string,
                    value: string
                }
            }[]
        }
    }): Hit['metaValues'] {
        return !data.metadata.meta ? {} : data.metadata.meta.reduce((values, meta) => {
            values[meta.$.name] = meta.$.value;
            return values;
        }, {});
    }


    private mapVariables(data: '' | {
        vars: {
            var: {
                $: {
                    name: string,
                    pos?: string,
                    lemma?: string
                }
            }[]
        }
    }): Hit['variableValues'] {
        if (!data) {
            return {};
        }
        return data.vars.var.reduce((values, variable) => {
            values[variable.$.name] = {
                pos: variable.$.pos,
                lemma: variable.$.lemma
            };
            return values;
        }, {});
    }

    private highlightSentence(sentence: string, nodeStarts: number[], tag: string) {
        // translated from treebank-search.php
        let prev: string, next: string;

        if (sentence.indexOf('<em>') >= 0) {
            // Showing the context of this hit
            let $groups = /(.*<em>)(.*?)(<\/em>.*)/.exec(sentence);
            sentence = $groups[2];
            prev = $groups[1];
            next = $groups[3];
        }

        let words = sentence.split(' ');

        // Instead of wrapping each individual word in a tag, merge sequences
        // of words in one <tag>...</tag>
        for (let i = 0; i < words.length; i++) {
            let word = words[i];
            if (nodeStarts.indexOf(i) >= 0) {
                let value = '';
                if (nodeStarts.indexOf(i - 1) == -1) {
                    value += `<${tag}>`;
                }
                value += words[i];
                if (nodeStarts.indexOf(i + 1) == -1) {
                    value += `</${tag}>`;
                }
                words[i] = value;
            }
        }
        let highlightedSentence = words.join(' ');
        if (prev || next) {
            highlightedSentence = prev + ' ' + highlightedSentence + ' ' + next;
        }

        return this.sanitizer.bypassSecurityTrustHtml(highlightedSentence);
    }
}

type ApiSearchResult = [
    // 0 sentences
    { [id: string]: string },
    // 1 tblist (used for Sonar)
    false,
    // 2 ids
    { [id: string]: string },
    // 3 begin positions
    { [id: string]: string },
    // 4 xml
    { [id: string]: string },
    // 5 meta list
    { [id: string]: string },
    // 6 variable list
    { [id: string]: string },
    // 7 end pos iteration
    number
];

export interface SearchResults {
    hits: Hit[],
    /**
     * Start offset for retrieving the next results
     */
    nextOffset: number
}

export interface Hit {
    fileId: string,
    component: string,
    sentence: string,
    highlightedSentence: SafeHtml,
    treeXml: string,
    /**
     * The ids of the matching nodes
     */
    nodeIds: number[],
    /**
     * The begin position of the matching nodes
     */
    nodeStarts: number[],
    metaValues: { [key: string]: string },
    /**
     * Contains the properties of the node matching the variable
     */
    variableValues: { [variableName: string]: { [propertyKey: string]: string } },
}


export type FilterValue = FilterSingleValue | FilterRangeValue<string> | FilterRangeValue<number>;

export interface FilterSingleValue {
    type: 'single';
    value: string
}

export interface FilterRangeValue<T> {
    type: 'range';
    min: T,
    max: T
}

export type TreebankCount = {
    databaseId: string,
    count: number
}
