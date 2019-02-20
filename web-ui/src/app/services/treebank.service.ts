import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Treebank, TreebankComponent, TreebankMetadata, ComponentGroup, FuzzyNumber } from '../treebank';
import { ConfigurationService } from "./configuration.service";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { filter, take } from "rxjs/operators";

export type ConfiguredTreebanks = {
    [provider: string]: {
        [corpus: string]: {
        	treebank: Treebank,
	        componentGroups: ComponentGroup[],
            metadata: TreebankMetadata[],
	        variants: string[]
        }
    }
};

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
    private loading = true;
    private data: ConfiguredTreebanks;
    public treebanks = new ReplaySubject<{state: ConfiguredTreebanks, origin: 'init'|'url'|'user'}>(1);

    constructor(private configurationService: ConfigurationService, private http: HttpClient) {
        this.configurationService.getProviders().then(providers => {
            return Promise.all(providers.map(provider => this.configurationService
                .getApiUrl(provider, 'configured_treebanks')
                .then(url => this.http.get<ConfiguredTreebanksResponse>(url).toPromise())
                .then(response => {
                    // treebanks within this provider
                    const result = {} as ConfiguredTreebanks[string];

                    Object.entries(response).map(([corpusName, treebank]) => {
                       result[corpusName] = {
                            treebank: {
                                name: corpusName,
                                title: treebank.title,
                                description: treebank.description,
                                uploaded: false,
                                provider,
                                selected: false,
                            },
                            metadata: treebank.metadata,
                            components: Object.keys(treebank.components).map(key => {
                                let component = treebank.components[key];
                                return {
                                    id: component.database_id,
                                    server_id: key,
                                    title: component.title,
                                    description: component.description,
                                    sentenceCount: component.sentences,
                                    wordCount: component.words,
                                    selected: true
                                }
                            }),
                        };
                    });

                    // return the part of the configuredTreebanks for this provider
                    return {
                        [provider]: result
                    }
                })
            ))
            .then((x: ConfiguredTreebanks[]) => { // merge them into one
                const configuredTreebanks = {} as ConfiguredTreebanks;
                x.forEach(y => Object.assign(configuredTreebanks, y))

                this.loading = false;
                this.data = configuredTreebanks;
                this.treebanks.next({state: configuredTreebanks, origin: 'init'});
                return configuredTreebanks;
            })
        })
    }


        return [];
        // This is for user-uploaded corpora only, which are not supported for now.
        // let data = await this.http.get<{
        //     id: string,
        //     treebank_id: string,
        //     field: string,
        //     type: 'text' | 'int' | 'date',
        //     facet: 'checkbox' | 'slider' | 'date_range',
        //     min_value: string | null,
        //     max_value: string | null,
        //     show: '1' | '0'
        // }[]>(await this.configurationService.getUploadApiUrl('treebank/metadata/' + corpus)).toPromise();

        // return data.map(item => {
        //     let metadata: TreebankMetadata = {
        //         field: item.field,
        //         type: item.type,
        //         facet: item.facet == 'date_range' ? 'range' : item.facet,
        //         show: item.show == '1'
        //     };
        //     if (['slider', 'range'].indexOf(metadata.facet) !== -1) {
        //         switch (metadata.type) {
        //             case 'int':
        //                 metadata.minValue = parseInt(item.min_value);
        //                 metadata.maxValue = parseInt(item.max_value);
        //                 return metadata;
        //             case 'date':
        //                 metadata.minValue = new Date(item.min_value);
        //                 metadata.maxValue = new Date(item.max_value);
        //                 return metadata;
        //         }
        //     }

        //     return metadata;
        // })
    }

    // TODO
    // public async getComponentNamesFromIds(provider: string, corpus: string, componentIds: string[]): Promise<{id: string, server_id: string}[]> {
    //     if (!provider || !corpus) {
    //         debugger;
    //         throw new Error('Cannot get null treebank')
    //     }

    //     const components = await this.getComponents(provider, corpus);
    //     // TODO eliminate the n^2 loop over components
    //     return componentIds.map(id => ({
    //         id,
    //         server_id: components.find(c => c.id === id).server_id
    //     }));
    // }

    // public async getTreebank(provider: string, corpus: string): Promise<ConfiguredTreebanks[string][string]> {
    //     if (!provider || !corpus) {
    //         debugger;
    //         throw new Error('Cannot get null treebank')
    //     }

    //     const treebank = (await this.getConfiguredTreebanks())[provider][corpus];
    //     if (!treebank) {
    //         debugger;
    //         throw new Error(`Missing treebank ${provider}:${corpus}!`)
    //     }
    //     return treebank;
    // }

    // public async getTreebanks(provider: string): Promise<Treebank[]> {
    //     if (!provider) {
    //         throw new Error('Cannot get treebanks for null provider')
    //     }

    //     // NOTE: disabled retrieving uploaded treebanks, not available in paqu back-end
    //     // Perhaps we need a flag per provider
    //     let [configured/*, uploadedData*/] = await Promise.all([
    //         this.getConfiguredTreebanks()/*,
    //         this.http.get<{
    //             email: string,
    //             id: string
    //             processed: string,
    //             public: "1" | "0",
    //             title: string,
    //             uploaded, string,
    //             user_id: string
    //         }[]>(await this.configurationService.getUploadApiUrl("treebank")).toPromise()*/],
    //     );

    //     return Object.values(configured[provider]).map(c => c.treebank)/*.concat(
    //         uploadedData.map(item => {
    //             return {
    //                 id: parseInt(item.id),
    //                 name: item.title,
    //                 title: item.title,
    //                 userId: parseInt(item.user_id),
    //                 email: item.email,
    //                 uploaded: new Date(item.uploaded),
    //                 processed: new Date(item.processed),
    //                 isPublic: item.public == '1'
    //             };
    //         }))*/.sort((a, b) => a.title.localeCompare(b.title));
    // }

    // public async getComponents(provider: string, corpus: string): Promise<TreebankComponent[]> {
    //     if (provider == null) {
    //         debugger;
    //     }

    //     let configuredTreebank = (await this.getConfiguredTreebanks())[provider][corpus];
    //     if (configuredTreebank) {
    //         return configuredTreebank.components;
    //     }

    //     // This is for user-uploaded corpora only, which are not supported for now.
    //     return [];
    //     // let results = await this.http.get<{
    //     //     basex_db: string,
    //     //     nr_sentences: string,
    //     //     nr_words: string,
    //     //     slug: string,
    //     //     title: string
    //     // }[]>(await this.configurationService.getUploadApiUrl(`treebank/show/${corpus}`)).toPromise();
    //     // return results.map(subtree => ({
    //     //     databaseId: subtree.basex_db,
    //     //     component: subtree.slug.toUpperCase(),
    //     //     title: subtree.title,
    //     //     sentenceCount: parseInt(subtree.nr_sentences),
    //     //     wordCount: parseInt(subtree.nr_words)
    //     // }));
    // }


    // SELECTION

    selectCorpus(provider: string, corpus: string, selected: boolean) {
        if (this.loading) {
            return;
        }
        const next = this.data;
        next[provider][corpus].treebank.selected = selected;
        this.treebanks.next({state: next, origin: 'user'});
    }

    toggleCorpus(provider: string, corpus: string) {
        if (this.loading) {
            return;
        }
        this.selectCorpus(
            provider,
            corpus,
            !this.data[provider][corpus].treebank.selected
        );
    }

    selectComponents(provider: string, corpus: string, components: {componentId: string, selected: boolean}[]) {
        if (this.loading) {
            return;
        }
        const next = this.data;
        components.forEach(componentToSelect => next[provider][corpus].components.find(c => componentToSelect.componentId === c.id)!.selected = componentToSelect.selected);
        this.treebanks.next({state: next, origin: 'user'});
    }
/*
    async getComponentGroups(provider: string, treebankName: string): Promise<{ variants: string[], groups: ComponentGroup[] }> {
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

*/

    /** Apply all passed selections states, everything else is DESELECTED */
    async select(state?: ReturnType<typeof mapTreebanksToSelectionSettings>) {
        if (!state) {
            return;
        }

        // await initialization
        // (this may be called when restoring state from url, prior to initialization)
        const {state: next} = await (this.treebanks.pipe(take(1)).toPromise());

        Object.values(next).flatMap(v => Object.values(v))
        .forEach(bank => {
            bank.treebank.selected = false;
            // components of deselected treebanks are never present in state
            // while they may still be present in the background
            // they aren't serialized to the url
            // so skip setting the components individually or they are cleared when the main bank is deselected
            // bank.components.forEach(c => c.selected = false);
        });
        state.forEach(s => {
            const tb = next[s.provider][s.corpus];
            // select only those components in the state.components
            tb.components.forEach(c => c.selected = s.components.find(sc => sc.id === c.id) != null)
            tb.treebank.selected = true;
        })
        this.treebanks.next({state: next, origin: 'url'});
    }
}

export function mapToTreebankArray(banks: ConfiguredTreebanks) {
    return Object.entries(banks).map(([provider, treebanks]) => treebanks)
    .flatMap(treebanks => Object.values(treebanks).map(v => v.treebank));
}

export function mapTreebanksToSelectionSettings(treebanks: ConfiguredTreebanks) {
    return Object.values(treebanks).flatMap(v => Object.values(v))
    .filter(({treebank, components}) => treebank.selected && components.some(c => c.selected))
    .map(({treebank, components}) => ({
        provider: treebank.provider,
        corpus: treebank.name,
        components: components.filter(c => c.selected).map(({id, server_id}) => ({id, server_id}))
    }))
}
