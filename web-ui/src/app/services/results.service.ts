import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Observable } from "rxjs/Observable";

import { ConfigurationService } from './configuration.service';
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


    constructor(private http: HttpClient, private sanitizer: DomSanitizer, private configurationService: ConfigurationService, private xmlParseService: XmlParseService) {
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
            let remainingDatabases: string[] | null = null;
            while (!observer.closed) {
                await this.results(xpath, corpus, components, offset, retrieveContext, isAnalysis, metadataFilters, variables, remainingDatabases)
                    .then((res) => {
                        if (res) {
                            observer.next(res);
                            offset = res.nextOffset;
                            remainingDatabases = res.remainingDatabases;
                            if (remainingDatabases.length == 0) {
                                observer.complete();
                            }
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
        variables = this.defaultVariables,
        remainingDatabases: string[] | null = null) {
        let results = await this.http.post<ApiSearchResult | false>(routerUrl + 'results', {
            xpath: xpath + this.createMetadataFilterQuery(metadataFilters),
            retrieveContext,
            corpus,
            components,
            offset,
            isAnalysis,
            variables,
            remainingDatabases
        }, httpOptions).toPromise();
        if (results) {
            return this.mapResults(results);
        }

        return false;
    }

    async highlightSentenceTree(sentenceId: string, treebank: string, nodeIds: number[]) {
        let base = this.configurationService.getBaseUrlGretel();
        let url = `${base}/front-end-includes/show-tree.php?sid=${sentenceId}&tb=${treebank}&id=${nodeIds.join('-')}`;

        let treeXml = await this.http.get(url, { responseType: 'text' }).toPromise();
        return treeXml;
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
            nextOffset: results[7],
            remainingDatabases: results[8]
        }
    }

    private mapHits(results: ApiSearchResult): Promise<Hit[]> {
        return Promise.all(Object.keys(results[0]).map(async hitId => {
            let sentence = results[0][hitId];
            let nodeStarts = results[3][hitId].split('-').map(x => parseInt(x));
            let metaValues = this.mapMeta(await this.xmlParseService.parse(`<metadata>${results[5][hitId]}</metadata>`));
            let variableValues = this.mapVariables(await this.xmlParseService.parse(results[6][hitId]));
            return {
                databaseId: results[9][hitId],
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

/**
 * The results as returned by the API. The results consist of an array containing various parts
 * of the results. These are described for each item position below.
 * Each result has an ID which corresponds. For example results[0] contains a dictionary with
 * the plain text sentences, they same keys are used for results[4] containing the xml of
 * each hit.
 */
type ApiSearchResult = [
    // 0 plain text sentences containing the hit
    { [id: string]: string },
    // 1 tblist (used for Sonar)
    false,
    // 2 ids (dash-separated ids of the matched nodes)
    { [id: string]: string },
    // 3 begin positions (zero based)
    { [id: string]: string },
    // 4 xml structure of the hit itself, does not include the containing the sentence
    { [id: string]: string },
    // 5 meta list (xml structure containing the meta values)
    { [id: string]: string },
    // 6 variable list (xml structure containing the variables)
    { [id: string]: string },
    // 7 end pos iteration (used for retrieving the next results when scrolling/paging)
    number,
    // 8 databases left to search (if this is empty, the search is done)
    string[],
    // 9 database ID of each hit
    { [id: string]: string }
];

export interface SearchResults {
    hits: Hit[],
    /**
     * Start offset for retrieving the next results (in the first database in `remainingDatabases`)
     */
    nextOffset: number,
    /**
     * Databases remaining for doing a paged search
     */
    remainingDatabases: string[]
}

export interface Hit {
    databaseId: string,
    fileId: string,
    /**
     * This value is not very reliable, because it is based on the filename
     */
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
