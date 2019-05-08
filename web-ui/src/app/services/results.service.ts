import * as $ from 'jquery';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { Observable, Observer, ReplaySubject, Subscriber, of } from 'rxjs';

import { ConfigurationService } from './configuration.service';
import { XmlParseService } from './xml-parse.service';
import { publish, publishReplay, publishLast, refCount } from 'rxjs/operators';
import { ObserversModule } from '@angular/cdk/observers';
import { PathVariable, Location } from 'lassy-xpath/ng';

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
        provider: string,
        corpus: string,
        componentIds: string[],
        retrieveContext: boolean,
        isAnalysis = this.defaultIsAnalysis,
        metadataFilters = this.defaultMetadataFilters,
        variables = this.defaultVariables,
        cancellationToken: Observable<{}> | null = null
    ): Promise<Hit[]> {
        return new Promise<Hit[]>((resolve, reject) => {
            const hits: Hit[] = [];
            const subscription = this.getAllResults(
                xpath,
                provider,
                corpus,
                componentIds,
                retrieveContext,
                isAnalysis,
                metadataFilters,
                variables
            ).subscribe(
                res => hits.push(...res.hits),
                () => {},
                () => resolve(hits)
            );
            // .subscribe(results => hits.push(...results.hits));
            if (cancellationToken != null) {
                cancellationToken.subscribe(() => {
                    subscription.unsubscribe();
                });
            }
        });
    }

    getAllResults(
        xpath: string,
        provider: string,
        corpus: string,
        componentIds: string[],
        retrieveContext: boolean,
        isAnalysis = this.defaultIsAnalysis,
        metadataFilters = this.defaultMetadataFilters,
        variables = this.defaultVariables
    ): Observable<SearchResults> {
        const observable = new Observable<SearchResults>(observer => {
            const worker = async () => {
                let iteration = 0;
                let remainingDatabases: string[] | null = null;
                let searchLimit: number | null = null;
                let already: SearchResults['already'] = null;
                let needRegularGrinded = false;

                while (!observer.closed) {
                    const results: SearchResults|false = await this.results(
                        xpath,
                        provider,
                        corpus,
                        componentIds,
                        iteration,
                        retrieveContext,
                        isAnalysis,
                        metadataFilters,
                        variables,
                        remainingDatabases,
                        already,
                        needRegularGrinded,
                        searchLimit
                    );

                    if (results) {
                        already = results.already;
                        needRegularGrinded = results.needRegularGrinded;
                        searchLimit = results.searchLimit;

                        observer.next(results);
                        iteration = results.nextIteration;
                        remainingDatabases = results.remainingDatabases;
                        if (remainingDatabases.length === 0) {
                            observer.complete();
                        }
                    } else {
                        observer.complete();
                    }
                }
            }
            worker();
        });

        return observable.pipe(publishReplay(1), refCount());
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
    private async results(xpath: string,
        provider: string,
        corpus: string,
        components: string[],
        iteration: number = 0,
        retrieveContext: boolean,
        isAnalysis = this.defaultIsAnalysis,
        metadataFilters = this.defaultMetadataFilters,
        variables = this.defaultVariables,
        remainingDatabases: string[] | null = null,
        already: SearchResults['already'] | null = null,
        needRegularGrinded = false,
        searchLimit: number | null = null): Promise<SearchResults | false> {
        const results = await this.http.post<ApiSearchResult | false>(
            await this.configurationService.getApiUrl(provider, 'results'), {
                xpath: this.createFilteredQuery(xpath, metadataFilters),
                retrieveContext,
                corpus,
                components,
                iteration,
                isAnalysis,
                variables,
                remainingDatabases,
                already,
                needRegularGrinded,
                searchLimit
            }, httpOptions).toPromise();
        if (results) {
            return this.mapResults(results);
        }

        return false;
    }

    /** Retrieves the full sentence tree and adds a "highlight=yes" attribute to all nodes with ID, and their descendants. */
    async highlightSentenceTree(provider: string, sentenceId: string, treebank: string, nodeIds: number[], database: string = null) {
        const url = await this.configurationService.getApiUrl(
            provider,
            'tree',
            [treebank, sentenceId],
            { ...(database && { db: database }) });

        const treeXml = await this.http.get(url, { responseType: 'text' }).toPromise();
        return this.highlightSentenceNodes(treeXml, nodeIds);
    }

    /** adds a "highlight=yes" attribute to all nodes with ID, and their descendants. */
    public highlightSentenceNodes(treeXml: string, nodeIds: Array<string|number>): string {
        const doc = $.parseXML(treeXml);
        const highlightNodes = Array.from(doc.querySelectorAll(nodeIds.map(id => `node[id="${id}"]`).join(',')));
        const highlightDescendants = highlightNodes
            .filter(n => n.hasAttribute('index'))
            .flatMap(n => Array.from(n.querySelectorAll(`node[index="${n.getAttribute('index')}"]`)));

        for (const node of [...highlightNodes, ...highlightDescendants]) {
            node.setAttribute('highlight', 'yes');
        }

        return new XMLSerializer().serializeToString(doc);
    }

    async metadataCounts(xpath: string, provider: string, corpus: string, components: string[], metadataFilters: FilterValue[] = []) {
        return await this.http.post<MetadataValueCounts>(
            await this.configurationService.getApiUrl(provider, 'metadata_counts'), {
                xpath: this.createFilteredQuery(xpath, metadataFilters),
                corpus,
                components,
            }, httpOptions).toPromise();
    }

    async treebankCounts(xpath: string, provider: string, corpus: string, components: string[], metadataFilters: FilterValue[] = []) {
        const results = await this.http.post<{ [databaseId: string]: string }>(
            await this.configurationService.getApiUrl(provider, 'treebank_counts'), {
                xpath: this.createFilteredQuery(xpath, metadataFilters),
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
     * Modifies an xpath query to query on filters.
     *
     * @param xpath Query to modify
     * @return string The modified xpath
     */
    public createFilteredQuery(xpath: string, filters: FilterValue[]) {
        function escape(value: string | number) {
            return value.toString()
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;');
        }

        const modifiedXpath = (xpath || '').trimRight().split('\n').map(line => ({
            line,
            appends: [] as { position: number, text: string }[]
        }));
        const metadataFilters: string[] = [];
        for (const filter of filters) {
            switch (filter.type) {
                case 'single':
                    // Single values
                    metadataFilters.push(`\tmeta[@name="${escape(filter.field)}" and @value="${escape(filter.value)}"]`);
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

                    metadataFilters.push(`\tmeta[@name="${escape(filter.field)}" and\n\t\t${value}>=${min} and ${value}<=${max}]`);
                    break;
                case 'multiple':
                    // Single values
                    metadataFilters.push(
                        `\tmeta[@name="${escape(filter.field)}" and
\t\t(${filter.values.map((v) => `@value="${escape(v)}"`).join(' or\n\t\t ')})]`);
                    break;
                case 'xpath':
                    const line = modifiedXpath[filter.location.line - 1];
                    if (line && line.line.substring(filter.location.firstColumn, filter.location.lastColumn) === 'node') {
                        line.appends.push({ position: filter.location.lastColumn, text: filter.attributeXpath });
                    } else {
                        modifiedXpath.push({
                            line: `[${filter.contextXpath}${filter.attributeXpath}]`,
                            appends: []
                        });
                    }
                    break;
            }
        }

        return modifiedXpath.map(line => {
            let offset = 0;
            const lineChars = line.line.split('');
            for (const append of line.appends.sort(a => a.position)) {
                lineChars.splice(append.position + offset, 0, ...append.text.split(''));
                offset += append.text.length;
            }
            return lineChars.join('');
        }).join('\n') + (!metadataFilters.length ? '' : `\n[ancestor::alpino_ds/metadata[\n${metadataFilters.join(' and\n')}]]`)
            .replace(/\t/g, '    ');
    }

    /**
     * Gets filters for an extracted xpath query
     * @param variable The variable name of the node.
     * @param attribute The attribute of that node to filter
     * @param value The attribute value (or null for not filtering)
     * @param value The available variables
     */
    public getFilterForQuery(
        variable: string,
        attribute: string,
        value: string,
        variables: { [name: string]: PathVariable }): FilterByXPath {
        const attrSelector = value
            ? `@${attribute}="${value}"`
            : `@${attribute}="" or not(@${attribute})`;
        return {
            field: `${variable}.${attribute}`,
            label: `${variable}[${attrSelector}]`,
            type: 'xpath',
            location: variables[variable].location,
            contextXpath: this.resolveRootPath(variables, variable),
            attributeXpath: `[${attrSelector}]`
        };
    }

    private resolveRootPath(variables: { [name: string]: PathVariable }, variable: string): string {
        const path = variables[variable].path;
        if (/^\*/.test(path)) {
            return '';
        }

        const match = path.match(/(^\$node\d*)\//);
        if (match) {
            const parentVar = match[1];
            const parentPath = this.resolveRootPath(variables, parentVar);

            return (parentPath ? `${parentPath}/` : '') + path.substring(match[0].length);
        }
    }

    private async mapResults(results: ApiSearchResult): Promise<SearchResults> {
        return results.success ?
            {
                hits: await this.mapHits(results),
                nextIteration: results.endPosIteration,
                remainingDatabases: results.databases,
                already: results.already,
                needRegularGrinded: results.needRegularGrinded,
                searchLimit: results.searchLimit
            } : {
                hits: [],
                nextIteration: 0,
                remainingDatabases: [],
                already: {},
                needRegularGrinded: false,
                searchLimit: 0
            };
    }

    private mapHits(results: ApiSearchResult): Promise<Hit[]> {
        if (!results.success) {
            return Promise.resolve([]);
        }

        return Promise.all(Object.keys(results.sentences).map(async hitId => {
            const sentence = results.sentences[hitId];
            const nodeStarts = results.beginlist[hitId].split('-').map(x => parseInt(x, 10));
            const metaValues = this.mapMeta(await this.xmlParseService.parse(`<metadata>${results.metalist[hitId]}</metadata>`));
            const variableValues = this.mapVariables(await this.xmlParseService.parse(results.varlist[hitId]));
            return {
                component: (results.tblist && results.tblist[hitId]) || results.sentenceDatabases[hitId],
                fileId: hitId.replace(/-endPos=(\d+|all)\+match=\d+$/, ''),
                // component: hitId.replace(/\-.*/, '').toUpperCase(),
                sentence,
                highlightedSentence: this.highlightSentence(sentence, nodeStarts, 'strong'),
                treeXml: results.xmllist[hitId],
                nodeIds: results.idlist[hitId].split('-').map(x => parseInt(x, 10)),
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
        return !data.metadata || !data.metadata.meta ? {} : data.metadata.meta.reduce((values, meta) => {
            values[meta.$.name] = meta.$.value;
            return values;
        }, {} as Hit['metaValues']);
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
        }, {} as Hit['variableValues']);
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
type ApiSearchResult = {
    success: true
    // 0 plain text sentences containing the hit
    sentences: { [id: string]: string },
    // 1 tblist (used for Grinded corpora)
    tblist: false | { [id: string]: string },
    // 2 ids (dash-separated ids of the matched nodes)
    idlist: { [id: string]: string },
    // 3 begin positions (zero based)
    beginlist: { [id: string]: string },
    // 4 xml structure of the hit itself, does not include the containing the sentence
    xmllist: { [id: string]: string },
    // 5 meta list (xml structure containing the meta values)
    metalist: { [id: string]: string },
    // 6 variable list (xml structure containing the variables)
    varlist: { [id: string]: string },
    // 7 end pos iteration (used for retrieving the next results when scrolling/paging)
    endPosIteration: number,
    // 8 databases left to search (if this is empty, the search is done)
    databases: string[],
    // 9 database ID of each hit
    sentenceDatabases: { [id: string]: string },
    // 10 XQuery
    xquery: string,
    // 11 Already
    already: SearchResults['already'],
    // 12 need regular grinded database
    needRegularGrinded: boolean,
    // 13 search limit
    searchLimit: number
} | {
    // no results
    success: false,
    // xquery
    xquery: string
};

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
    needRegularGrinded: boolean;
    searchLimit: number;
}

export interface Hit {
    /** Id of the component this hit originated from */
    component: string;
    fileId: string;
    // /**
    //  * This value is not very reliable, because it is based on the filename
    //  */
    // component: string;
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
    location: Location;
    /**
     * The predicate to add to the node to filter it.
     */
    attributeXpath: string;
    /**
     * Selector to add to the entire query to select the node
     * being filtered on. This is necessary if the node cannot be
     * modified in the main query. That can happen if that query has
     * been changed by the user (in the results component).
     */
    contextXpath: string;
}

export interface TreebankCount {
    databaseId: string;
    count: number;
}

export interface MetadataValueCounts { [key: string]: { [value: string]: number }; }
