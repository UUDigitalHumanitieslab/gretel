import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Treebank, SubTreebank, TreebankMetadata, ComponentGroup, FuzzyNumber } from '../treebank';
import { ConfigurationService } from "./configuration.service";

type ConfiguredTreebanks = {
    [corpus: string]: {
        treebank: Treebank,
        componentGroups: ComponentGroup[],
        metadata: TreebankMetadata[],
        variants: string[]
    }
};
let configuredTreebanks: Promise<ConfiguredTreebanks> | null = null;

type ConfiguredTreebanksResponse = {
    [treebank: string]: {
        'components': {
            [component: string]: {
                'database_id': string,
                'description': string,
                'sentences': number | '?',
                'title': string,
                'words': number | '?',
                'group'?: string,
                'variant'?: string,
                'disabled'?: boolean
            }
        },
        'groups'?: {
            [component: string]: {
                'description': string
            }
        },
        'variants'?: {
            [component: string]: {
                'display': string
            }
        },
        'description': string,
        'title': string,
        'metadata': {
            field: string,
            type: 'text' | 'int' | 'date',
            facet: 'checkbox' | 'slider' | 'range' | 'dropdown',
            show: boolean,
            minValue?: number | Date,
            maxValue?: number | Date,
        }[],
        'multioption': boolean
    }
};
@Injectable()
export class TreebankService {

    constructor(private configurationService: ConfigurationService, private http: HttpClient) {
    }

    private async getConfiguredTreebanks() {
        if (configuredTreebanks) {
            return configuredTreebanks;
        }

        return configuredTreebanks = new Promise(async (resolve, reject) => {
            let response = await this.http.get<ConfiguredTreebanksResponse>(
                await this.configurationService.getApiUrl('configured_treebanks')).toPromise();

            let result: ConfiguredTreebanks = {};
            for (let corpusName in response) {
                let treebank = response[corpusName];
                result[corpusName] = {
                    treebank: {
                        name: corpusName,
                        title: treebank.title,
                        description: treebank.description,
                        uploaded: false
                    },
                    metadata: treebank.metadata,
                    variants: treebank.variants ? Object.keys(treebank.variants) : ['default'],
                    componentGroups: Object.keys(treebank.components).map(key => {
                        let component = treebank.components[key];
                        return {
                            databaseId: component.database_id,
                            disabled: !!component.disabled,
                            component: key,
                            title: component.title,
                            description: component.description,
                            sentenceCount: component.sentences,
                            wordCount: component.words,
                            group: component.group || key,
                            variant: component.variant || 'default'
                        }
                    }).reduce((groups, component) => {
                        let group = groups.find(g => g.key == component.group);

                        if (!group.description) {
                            group.description = component.description;
                        }

                        group.components[component.variant] = component;
                        group.sentenceCount.add(component.sentenceCount);
                        group.wordCount.add(component.wordCount);

                        return groups;
                    }, Object.keys(treebank.groups ? treebank.groups : treebank.components).map(key => ({
                        components: {},
                        description: treebank.groups &&
                            treebank.groups[key] &&
                            treebank.groups[key].description ||
                            null,
                        key: key,
                        sentenceCount: new FuzzyNumber(0),
                        wordCount: new FuzzyNumber(0)
                    })))
                };
            }

            resolve(result);
        });

    }

    public async getMetadata(corpus: string): Promise<TreebankMetadata[]> {
        let configuredTreebank = (await this.getConfiguredTreebanks())[corpus];

        if (configuredTreebank) {
            return configuredTreebank.metadata;
        }

        let data = await this.http.get<{
            id: string,
            treebank_id: string,
            field: string,
            type: 'text' | 'int' | 'date',
            facet: 'checkbox' | 'slider' | 'date_range',
            min_value: string | null,
            max_value: string | null,
            show: '1' | '0'
        }[]>(await this.configurationService.getUploadApiUrl('treebank/metadata/' + corpus)).toPromise();

        return data.map(item => {
            let metadata: TreebankMetadata = {
                field: item.field,
                type: item.type,
                facet: item.facet == 'date_range' ? 'range' : item.facet,
                show: item.show == '1'
            };
            if (['slider', 'range'].indexOf(metadata.facet) !== -1) {
                switch (metadata.type) {
                    case 'int':
                        metadata.minValue = parseInt(item.min_value);
                        metadata.maxValue = parseInt(item.max_value);
                        return metadata;
                    case 'date':
                        metadata.minValue = new Date(item.min_value);
                        metadata.maxValue = new Date(item.max_value);
                        return metadata;
                }
            }

            return metadata;
        })
    }

    async getTreebanks(): Promise<Treebank[]> {
        let [configured, uploadedData] = await Promise.all([
            this.getConfiguredTreebanks(),
            this.http.get<{
                email: string,
                id: string
                processed: string,
                public: "1" | "0",
                title: string,
                uploaded, string,
                user_id: string
            }[]>(await this.configurationService.getUploadApiUrl("treebank")).toPromise()],
        );

        return Object.values(configured).map(c => c.treebank).concat(
            uploadedData.map(item => {
                return {
                    id: parseInt(item.id),
                    name: item.title,
                    title: item.title,
                    userId: parseInt(item.user_id),
                    email: item.email,
                    uploaded: new Date(item.uploaded),
                    processed: new Date(item.processed),
                    isPublic: item.public == '1'
                };
            })).sort((a, b) => a.title.localeCompare(b.title));
    }

    async getComponentGroups(treebankName: string): Promise<{ variants: string[], groups: ComponentGroup[] }> {
        let configuredTreebank = (await this.getConfiguredTreebanks())[treebankName];
        if (configuredTreebank) {
            return { variants: configuredTreebank.variants, groups: configuredTreebank.componentGroups };
        }

        let results = await this.http.get<{
            basex_db: string,
            nr_sentences: string,
            nr_words: string,
            slug: string,
            title: string
        }[]>(await this.configurationService.getUploadApiUrl(`treebank/show/${treebankName}`)).toPromise();
        return {
            variants: ['default'],
            groups:
                results.map(subtree => {
                    let component = subtree.slug.toUpperCase()
                    return {
                        group: component,
                        variant: 'default',
                        databaseId: subtree.basex_db,
                        component,
                        title: subtree.title,
                        sentenceCount: parseInt(subtree.nr_sentences),
                        wordCount: parseInt(subtree.nr_words),
                        disabled: false
                    }
                }).map(component => ({
                    key: component.component,
                    components: { default: component },
                    sentenceCount: new FuzzyNumber(component.sentenceCount),
                    wordCount: new FuzzyNumber(component.wordCount)
                }))
        };
    }
}
