import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Observable, Observer } from 'rxjs';

import { ConfigurationService } from './configuration.service';
import { XmlParseService } from './xml-parse.service';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
    })
};

@Injectable()
export class ResultsService {
    defaultIsAnalysis = false;
    defaultMetadataFilters: FilterValue[] = [];
    defaultVariables: { name: string, path: string }[] = null;

    constructor(
        private http: HttpClient,
        private sanitizer: DomSanitizer,
        private configurationService: ConfigurationService,
        private xmlParseService: XmlParseService) {
    }

    promiseAllResults(xpath: string,
        corpus: string,
        components: string[],
        retrieveContext: boolean,
        isAnalysis = this.defaultIsAnalysis,
        metadataFilters = this.defaultMetadataFilters,
        variables = this.defaultVariables,
        cancellationToken: Observable<{}> | null = null) {
        return new Promise<Hit[]>((resolve, reject) => {
            const hits: Hit[] = [];
            const subscription = this.getAllResults(xpath,
                corpus,
                components,
                retrieveContext,
                isAnalysis,
                metadataFilters,
                variables,
                () => resolve(hits))
                .subscribe(results => hits.push(...results.hits));
            cancellationToken.subscribe(() => {
                subscription.unsubscribe();
            });
        });
    }

    getAllResults(xpath: string,
        corpus: string,
        components: string[],
        retrieveContext: boolean,
        isAnalysis = this.defaultIsAnalysis,
        metadataFilters = this.defaultMetadataFilters,
        variables = this.defaultVariables,
        complete?: () => void) {
        const observable: Observable<SearchResults> = Observable.create(async (observer: Observer<SearchResults>) => {
            let iteration = 0;
            let remainingDatabases: string[] | null = null;
            const completeObserver = () => {
                if (complete) {
                    complete();
                }
                observer.complete();
            };
            let already: SearchResults['already'] = {};
            while (!observer.closed) {
                const results = await this.results(
                    xpath,
                    corpus,
                    components,
                    iteration,
                    retrieveContext,
                    isAnalysis,
                    metadataFilters,
                    variables,
                    remainingDatabases,
                    already);

                if (results) {
                    already = results.already;
                    observer.next(results);
                    iteration = results.nextIteration;
                    remainingDatabases = results.remainingDatabases;
                    if (remainingDatabases.length === 0) {
                        completeObserver();
                    }
                } else {
                    completeObserver();
                }
            }
        });

        return observable;
    }

    /**
     * Queries the treebank and returns the matching hits.
     * @param xpath Specification of the pattern to match
     * @param corpus Identifier of the corpus
     * @param components Identifiers of the sub-treebanks
     * @param iteration Zero-based iteration number of the results
     * @param retrieveContext Get the sentence before and after the hit
     * @param isAnalysis Whether this search is done for retrieving analysis results, in that case a higher result limit is used
     * @param metadataFilters The filters to apply for the metadata properties
     * @param variables Named variables to query on the matched hit (can be determined using the Extractinator)
     */
    async results(xpath: string,
        corpus: string,
        components: string[],
        iteration: number = 0,
        retrieveContext: boolean,
        isAnalysis = this.defaultIsAnalysis,
        metadataFilters = this.defaultMetadataFilters,
        variables = this.defaultVariables,
        remainingDatabases: string[] | null = null,
        already: SearchResults['already'] | null = null) {
        const results = await this.http.post<ApiSearchResult | false>(
            await this.configurationService.getApiUrl('results'), {
                xpath: xpath + this.createMetadataFilterQuery(metadataFilters),
                retrieveContext,
                corpus,
                components,
                iteration,
                isAnalysis,
                variables,
                remainingDatabases,
                already
            }, httpOptions).toPromise();
        if (results) {
            return this.mapResults(results);
        }

        return false;
    }

    async highlightSentenceTree(sentenceId: string, treebank: string, nodeIds: number[], database: string = null) {
        const url = await this.configurationService.getGretelUrl(
            `front-end-includes/show-tree.php?sid=${sentenceId}&tb=${treebank}&id=${nodeIds.join('-')}${
            database ? `&db=${database}` : ''}`);

        const treeXml = await this.http.get(url, { responseType: 'text' }).toPromise();
        return { url, treeXml };
    }

    async metadataCounts(xpath: string, corpus: string, components: string[], metadataFilters: FilterValue[] = []) {
        return await this.http.post<MetadataValueCounts>(
            await this.configurationService.getApiUrl('metadata_counts'), {
                xpath: xpath + this.createMetadataFilterQuery(metadataFilters),
                corpus,
                components,
            }, httpOptions).toPromise();
    }

    async treebankCounts(xpath: string, corpus: string, components: string[], metadataFilters: FilterValue[] = []) {
        const results = await this.http.post<{ [databaseId: string]: string }>(
            await this.configurationService.getApiUrl('treebank_counts'), {
                xpath: xpath + this.createMetadataFilterQuery(metadataFilters),
                corpus,
                components,
            }, httpOptions).toPromise();

        return Object.keys(results).map(databaseId => {
            return {
                databaseId,
                count: parseInt(results[databaseId], 10)
            } as TreebankCount;
        });
    }

    /**
     * Builds the XQuery metadata filter.
     *
     * @return string The metadata filter
     */
    public createMetadataFilterQuery(filters: FilterValue[]) {
        function escape(value: string | number) {
            return value.toString()
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;');
        }

        // Compile the filter
        const filterQueries: string[] = [];
        for (const filter of filters) {
            switch (filter.type) {
                case 'single':
                    // Single values
                    filterQueries.push(
                        `[ancestor::alpino_ds/metadata/meta[@name="${escape(filter.field)}" and @value="${escape(filter.value)}"]]`);
                    break;
                case 'range':
                    // Ranged values
                    let min: string, max: string, value: string;
                    if (filter.dataType === 'date') {
                        // gets number in the format YYYYMMDD e.g. 19870227
                        min = filter.min.replace(/-/g, '');
                        max = filter.max.replace(/-/g, '');
                        value = `number(translate(@value,'-',''))`;
                    } else {
                        min = escape(filter.min);
                        max = escape(filter.max);
                        value = '@value';
                    }

                    filterQueries.push(
                        `[ancestor::alpino_ds/metadata/meta[@name="${
                        escape(filter.field)}" and\n\t${value}>=${min} and ${value}<=${max}]]`);
                    break;
                case 'multiple':
                    // Single values
                    filterQueries.push(`[ancestor::alpino_ds/metadata/meta[@name="${escape(filter.field)}" and\n\t(${
                        filter.values.map((v) => `@value="${escape(v)}"`).join(' or\n\t')})]]`);
                    break;
                case 'xpath':
                    filterQueries.push(`[${filter.xpath}]`);
                    break;
            }
        }
        return filterQueries.join('\n');
    }

    private async mapResults(results: ApiSearchResult): Promise<SearchResults> {
        return {
            hits: await this.mapHits(results),
            nextIteration: results[7],
            remainingDatabases: results[8],
            already: results[11]
        };
    }

    private mapHits(results: ApiSearchResult): Promise<Hit[]> {
        return Promise.all(Object.keys(results[0]).map(async hitId => {
            const sentence = results[0][hitId];
            const nodeStarts = results[3][hitId].split('-').map(x => parseInt(x, 10));
            const metaValues = this.mapMeta(await this.xmlParseService.parse(`<metadata>${results[5][hitId]}</metadata>`));
            const variableValues = this.mapVariables(await this.xmlParseService.parse(results[6][hitId]));
            return {
                databaseId: results[1][hitId] || results[9][hitId],
                fileId: hitId.replace(/-endPos=(\d+|all)\+match=\d+$/, ''),
                component: hitId.replace(/\-.*/, '').toUpperCase(),
                sentence,
                highlightedSentence: this.highlightSentence(sentence, nodeStarts, 'strong'),
                treeXml: results[4][hitId],
                nodeIds: results[2][hitId].split('-').map(x => parseInt(x, 10)),
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
            values[variable.$.name] = variable.$;
            return values;
        }, {});
    }

    private highlightSentence(sentence: string, nodeStarts: number[], tag: string) {
        // translated from treebank-search.php
        let prev: string, next: string;

        if (sentence.indexOf('<em>') >= 0) {
            // Showing the context of this hit
            const $groups = /(.*<em>)(.*?)(<\/em>.*)/.exec(sentence);
            sentence = $groups[2];
            prev = $groups[1];
            next = $groups[3];
        }

        const words = sentence.split(' ');

        // Instead of wrapping each individual word in a tag, merge sequences
        // of words in one <tag>...</tag>
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            if (nodeStarts.indexOf(i) >= 0) {
                let value = '';
                if (nodeStarts.indexOf(i - 1) === -1) {
                    value += `<${tag}>`;
                }
                value += words[i];
                if (nodeStarts.indexOf(i + 1) === -1) {
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
    // 1 tblist (used for Grinded corpora)
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
    { [id: string]: string },
    // 10 XQuery
    string,
    // 11 Already
    SearchResults['already']
];

export interface SearchResults {
    hits: Hit[];
    /**
     * Start iteration for retrieving the next results (in the first database in `remainingDatabases`)
     */
    nextIteration: number;
    /**
     * Databases remaining for doing a paged search
     */
    remainingDatabases: string[];
    /**
     * Already queried included treebanks (for grinded databases)
     */
    already: { [id: string]: 1 };
}

export interface Hit {
    databaseId: string;
    fileId: string;
    /**
     * This value is not very reliable, because it is based on the filename
     */
    component: string;
    sentence: string;
    highlightedSentence: SafeHtml;
    treeXml: string;
    /**
     * The ids of the matching nodes
     */
    nodeIds: number[];
    /**
     * The begin position of the matching nodes
     */
    nodeStarts: number[];
    metaValues: { [key: string]: string };
    /**
     * Contains the properties of the node matching the variable
     */
    variableValues: { [variableName: string]: { [propertyKey: string]: string } };
}


export type FilterValue = FilterByField | FilterByXPath;
export type FilterByField =
    FilterSingleValue
    | FilterRangeValue<string, 'date'>
    | FilterRangeValue<number, 'int'>
    | FilterMultipleValues<string, 'text'>;

export interface FilterValues { [field: string]: FilterValue; }

export interface FilterSingleValue {
    type: 'single';
    dataType: 'text';
    field: string;
    value: string;
}

export interface FilterRangeValue<T, U> {
    type: 'range';
    dataType: U;
    field: string;
    min: T;
    max: T;
}

export interface FilterMultipleValues<T, U> {
    type: 'multiple';
    dataType: U;
    values: Array<T>;
    field: string;
}

export interface FilterByXPath {
    /// The variable name + attribute e.g. $node1.pt
    field: string;
    type: 'xpath';
    label: string;
    xpath: string;
}

export interface TreebankCount {
    databaseId: string;
    count: number;
}

export interface MetadataValueCounts { [key: string]: { [value: string]: number }; }
