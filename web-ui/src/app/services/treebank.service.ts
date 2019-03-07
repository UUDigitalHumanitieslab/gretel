import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Treebank, TreebankComponent, TreebankMetadata, ComponentGroup, FuzzyNumber } from '../treebank';
import { ConfigurationService } from "./configuration.service";
import { ReplaySubject } from "rxjs";
import { take } from "rxjs/operators";

export type ConfiguredTreebanks = {
    [provider: string]: {
        [corpus: string]: {
        	treebank: Treebank,
	        componentGroups: ComponentGroup[],
            metadata: TreebankMetadata[],
	        variants: string[]
        };
    };
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
    };
};

type UploadedTreebankResponse = {
    email: string,
    id: string
    processed: string,
    public: "1" | "0",
    title: string,
    uploaded: string,
    user_id: string
}

type UploadedTreebankMetadataResponse = {
    id: string,
    treebank_id: string,
    field: string,
    type: 'text' | 'int' | 'date',
    facet: 'checkbox' | 'slider' | 'date_range',
    min_value: string | null,
    max_value: string | null,
    show: '1' | '0'
}

// not quite sure what this is yet
type UploadedTreebankShowResponse = {
    basex_db: string,
    nr_sentences: string,
    nr_words: string,
    slug: string,
    title: string
}

@Injectable()
export class TreebankService {
    private loading = true;
    private data: ConfiguredTreebanks;
    public treebanks = new ReplaySubject<{state: ConfiguredTreebanks, origin: 'init'|'url'|'user'}>(1);

    constructor(private configurationService: ConfigurationService, private http: HttpClient) {
        (async () => {
            const treebanks: ConfiguredTreebanks = {};

            const providers = await this.configurationService.getProviders();
            for (const provider of providers) {
                const url = await this.configurationService.getApiUrl(provider, 'configured_treebanks');
                const response = await this.http.get<ConfiguredTreebanksResponse>(url).toPromise();

                // treebanks within this provider
                const providedBanks: ConfiguredTreebanks[string] = treebanks[provider] = {};
                Object.entries(response).forEach(([corpusName, treebank]) => {
                    providedBanks[corpusName] = {
                        treebank: {
                            name: corpusName,
                            title: treebank.title,
                            description: treebank.description,
                            uploaded: false,
                            provider,
                            selected: false,
                            multiOption: treebank.multioption
                        },
                        metadata: treebank.metadata,
                        variants: treebank.variants ? Object.keys(treebank.variants) : ['default'],
                        componentGroups: Object.keys(treebank.components).map<TreebankComponent>(key => {
                            let component = treebank.components[key];
                            return {
                                id: component.database_id,
                                selected: !component.disabled,
                                server_id: key,
                                title: component.title,
                                description: component.description,
                                sentenceCount: component.sentences,
                                wordCount: component.words,
                                group: component.group || key,
                                variant: component.variant || 'default',
                                disabled: component.disabled || false
                            }
                        }).reduce((groups, component) => {
                            let group = groups.find(g => g.key === component.group);

                            if (!group.description) {
                                group.description = component.description;
                            }

                            group.components[component.variant] = component;
                            group.sentenceCount.add(component.sentenceCount);
                            group.wordCount.add(component.wordCount);

                            return groups;
                        }, Object.keys(treebank.groups ? treebank.groups : treebank.components).map<ComponentGroup>(key => ({
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
                });
            }

            const uploadProvider = await this.configurationService.getUploadProvider()
            const uploadedCorpora: ConfiguredTreebanks[string] = treebanks[uploadProvider] = (treebanks[uploadProvider] || {});
            const uploadUrl = await this.configurationService.getUploadApiUrl('treebank');
            const response = await this.http.get<UploadedTreebankResponse[]>(uploadUrl).toPromise();
            response.forEach(async (item) => {
                uploadedCorpora[item.id] = {
                    treebank: {
                        id: parseInt(item.id),
                        name: item.title,
                        title: item.title,
                        userId: parseInt(item.user_id),
                        email: item.email,
                        uploaded: new Date(item.uploaded),
                        processed: new Date(item.processed),
                        isPublic: item.public == '1',
                        description: item.title,
                        multiOption: true,
                        // TODO this will never work, the provider needs to resolve to a regular endpoint
                        provider: uploadProvider,
                        selected: true,
                    },
                    variants: ['default'],
                    componentGroups: await this.configurationService.getUploadApiUrl('treebank/show/' + item.id)
                        .then(url => this.http.get<UploadedTreebankShowResponse[]>(url).toPromise())
                        .then(results =>
                            results.map(subtree => {
                                let server_id = subtree.slug.toUpperCase()
                                const r: TreebankComponent = {
                                    id: subtree.basex_db,
                                    server_id,
                                    group: server_id,
                                    variant: 'default',
                                    title: subtree.title,
                                    sentenceCount: parseInt(subtree.nr_sentences),
                                    wordCount: parseInt(subtree.nr_words),
                                    selected: true,
                                    disabled: false,
                                    description: '',
                                }

                                return r;
                            })
                            .map(component => ({
                                key: component.server_id, // see group property in TreebankComponent created above
                                components: { default: component },
                                sentenceCount: new FuzzyNumber(component.sentenceCount),
                                wordCount: new FuzzyNumber(component.wordCount)
                            }))
                        ),
                    metadata: await this.configurationService.getUploadApiUrl('treebank/metadata/' + item.id)
                        .then(url => this.http.get<UploadedTreebankMetadataResponse[]>(url).toPromise())
                        .then(response => response.map(item => {
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
                        })),
                }
            })

            this.data = treebanks;
            this.treebanks.next({
                state: treebanks,
                origin: 'init'
            });
            this.loading = false;
        })()
    }

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

    toggleComponent(provider: string, corpus: string, componentId: string) {
        if (this.loading) {
            return;
        }
        const next = this.data;
        const tb = next[provider][corpus];
        tb.componentGroups.flatMap((group: ComponentGroup) => Object.values(group.components))
        .forEach(component => {
            if (component.id === componentId) {
                component.selected = !component.selected;
            }
        })

        this.treebanks.next({state: next, origin: 'user'});
    }

    selectAllComponents(provider: string, corpus: string, select: boolean) {
        const next = this.data;
        const tb = next[provider][corpus];
        tb.componentGroups
            .flatMap((group: ComponentGroup) => Object.values(group.components))
            .forEach(component => component.selected = select);
        tb.treebank.selected = select;

        this.treebanks.next({state: next, origin: 'user'});
    }

    selectComponents(provider: string, corpus: string, components: {componentId: string, selected: boolean}[]) {
        if (this.loading) {
            return;
        }

        // TODO make the callee do this?
        const selectionMap = components.reduce((map, c) => {
            map[c.componentId] = c.selected;
            return map;
        }, {} as {[id: string]: boolean});

        const next = this.data;
        const tb = next[provider][corpus];
        tb.componentGroups.flatMap((group: ComponentGroup) => Object.values(group.components))
        .forEach(component => {
            if (selectionMap[component.id] != null)
                component.selected = selectionMap[component.id];
        })

        this.treebanks.next({state: next, origin: 'user'});
    }

    /** Apply all passed selections states, everything else is DESELECTED */
    async select(state?: ReturnType<typeof mapTreebanksToSelectionSettings>) {
        if (!state) {
            return;
        }

        // await initialization
        // (this may be called when restoring state from url, prior to initialization)
        const {state: next} = await (this.treebanks.pipe(take(1)).toPromise());

        /**
         * Parent treebank selection state is inferred from the component selection state
         * any component present in the new state (selected or not)? => parent bank must be selected or it wouldn't be mentioned at all.
         * So first unselect all banks, then re-enable based on the components we encounter
         */
        Object.values(next).flatMap(v => Object.values(v))
        .forEach(bank => bank.treebank.selected = false);

        state.forEach(s => {
            const tb = next[s.provider][s.corpus];
            // select only those components in the state.components
            const components = tb.componentGroups.flatMap(group => Object.values(group.components));
            components.forEach(c => c.selected = s.components.find(sc => sc.id === c.id) != null)


            tb.treebank.selected = true;
        })
        this.treebanks.next({state: next, origin: 'url'});
    }
}

export function mapToTreebankArray(banks: ConfiguredTreebanks) {
    return Object.entries(banks)
        .map(([provider, treebanks]) => treebanks)
        .flatMap(treebanks =>
            Object.values(treebanks)
            .map(v => v.treebank)
        );
}

/**
 * Get an array of all selected treebank components, grouped by their parent treebank
 * @param treebanks
 */
export function mapTreebanksToSelectionSettings(treebanks: ConfiguredTreebanks): Array<{
    provider: string,
    corpus: string,
    components: Array<{
        id: string,
        server_id: string
    }>
}> {
    return Object.values(treebanks).flatMap(v => Object.values(v))
    .map(treebankData => ({
        treebank: treebankData.treebank,
        components: treebankData.componentGroups.flatMap(group => Object.values(group.components))
    }))
    .filter(v => v.treebank.selected && v.components.some(c => c.selected))
    .map(({treebank, components}) => ({
        provider: treebank.provider,
        corpus: treebank.name,
        components: components.filter(c => c.selected).map(({id, server_id}) => ({id, server_id}))
    }))
}
