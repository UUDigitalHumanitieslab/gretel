import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Treebank, SubTreebank, TreebankMetadata, ComponentGroup, FuzzyNumber } from '../treebank';
import { ConfigurationService } from './configuration.service';

interface ConfiguredTreebanks {
    [corpus: string]: {
        treebank: Treebank,
        componentGroups: ComponentGroup[],
        metadata: TreebankMetadata[],
        variants: string[]
    };
}
let configuredTreebanks: Promise<ConfiguredTreebanks> | null = null;

interface ConfiguredTreebanksResponse {
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
    };
}
@Injectable()
export class TreebankService {

    constructor(private configurationService: ConfigurationService, private http: HttpClient) {
    }

    private async getConfiguredTreebanks() {
        if (configuredTreebanks) {
            return configuredTreebanks;
        }

        return configuredTreebanks = new Promise(async (resolve, reject) => {
            const response = await this.http.get<ConfiguredTreebanksResponse>(
                await this.configurationService.getApiUrl('configured_treebanks')).toPromise();

            const result: ConfiguredTreebanks = {};
            for (const corpusName of Object.keys(response)) {
                const treebank = response[corpusName];
                result[corpusName] = {
                    treebank: {
                        name: corpusName,
                        title: treebank.title,
                        description: treebank.description,
                        uploaded: false,
                        multiOption: treebank.multioption
                    },
                    metadata: treebank.metadata,
                    variants: treebank.variants ? Object.keys(treebank.variants) : ['default'],
                    componentGroups: Object.keys(treebank.components).map(key => {
                        const component = treebank.components[key];
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
                        };
                    }).reduce((groups, component) => {
                        const group = groups.find(g => g.key === component.group);

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
                        wordCount: new FuzzyNumber(0),
                        multiOption: treebank.multioption
                    })))
                };
            }

            resolve(result);
        });

    }

    public async getMetadata(corpus: string): Promise<TreebankMetadata[]> {
        const configuredTreebank = (await this.getConfiguredTreebanks())[corpus];

        if (configuredTreebank) {
            return configuredTreebank.metadata;
        }

        const data = await this.http.get<{
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
            const metadata: TreebankMetadata = {
                field: item.field,
                type: item.type,
                facet: item.facet === 'date_range' ? 'range' : item.facet,
                show: item.show === '1'
            };
            if (['slider', 'range'].indexOf(metadata.facet) !== -1) {
                switch (metadata.type) {
                    case 'int':
                        metadata.minValue = parseInt(item.min_value, 10);
                        metadata.maxValue = parseInt(item.max_value, 10);
                        return metadata;
                    case 'date':
                        metadata.minValue = new Date(item.min_value);
                        metadata.maxValue = new Date(item.max_value);
                        return metadata;
                }
            }

            return metadata;
        });
    }

    async getTreebanks(): Promise<Treebank[]> {
        const [configured, uploadedData] = await Promise.all([
            this.getConfiguredTreebanks(),
            this.http.get<{
                email: string,
                id: string
                processed: string,
                public: '1' | '0',
                title: string,
                uploaded, string,
                user_id: string
            }[]>(await this.configurationService.getUploadApiUrl('treebank')).toPromise()],
        );

        return Object.values(configured).map(c => c.treebank).concat(
            uploadedData.map(item => {
                return {
                    id: parseInt(item.id, 10),
                    name: item.title,
                    title: item.title,
                    userId: parseInt(item.user_id, 10),
                    email: item.email,
                    uploaded: new Date(item.uploaded),
                    processed: new Date(item.processed),
                    isPublic: item.public === '1',
                    multiOption: true
                };
            })).sort((a, b) => a.title.localeCompare(b.title));
    }

    async getComponentGroups(treebankName: string): Promise<{
        multiOption: boolean,
        variants: string[],
        groups: ComponentGroup[]
    }> {
        const configuredTreebank = (await this.getConfiguredTreebanks())[treebankName];
        if (configuredTreebank) {
            return {
                multiOption: configuredTreebank.treebank.multiOption,
                variants: configuredTreebank.variants,
                groups: configuredTreebank.componentGroups
            };
        }

        const results = await this.http.get<{
            basex_db: string,
            nr_sentences: string,
            nr_words: string,
            slug: string,
            title: string
        }[]>(await this.configurationService.getUploadApiUrl(`treebank/show/${treebankName}`)).toPromise();
        return {
            multiOption: true,
            variants: ['default'],
            groups:
                results.map(subtree => {
                    const component = subtree.slug.toUpperCase();
                    return {
                        group: component,
                        variant: 'default',
                        databaseId: subtree.basex_db,
                        component,
                        title: subtree.title,
                        sentenceCount: parseInt(subtree.nr_sentences, 10),
                        wordCount: parseInt(subtree.nr_words, 10),
                        disabled: false
                    };
                }).map(component => ({
                    key: component.component,
                    components: { default: component },
                    sentenceCount: new FuzzyNumber(component.sentenceCount),
                    wordCount: new FuzzyNumber(component.wordCount)
                }))
        };
    }
}
