import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Treebank, TreebankComponent, TreebankMetadata, ComponentGroup, FuzzyNumber } from '../treebank';
import { ConfigurationService } from './configuration.service';
import { ReplaySubject } from 'rxjs';
import { take } from 'rxjs/operators';

export interface ConfiguredTreebanks {
    [provider: string]: {
        [corpus: string]: {
            treebank: Treebank;
            componentGroups: ComponentGroup[];
            metadata: TreebankMetadata[];
            variants: string[];
        };
    };
}

interface ConfiguredTreebanksResponse {
    [treebank: string]: {
        'components': {
            [component: string]: {
                'id': string,
                'title': string,
                'description': string,
                'sentences': number | '?',
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
        'multioption'?: boolean
    };
}

export interface UploadedTreebankResponse {
    email: string;
    id: string;
    processed: string;
    public: '1'|'0';
    title: string;
    uploaded: string;
    user_id: string;
}

interface UploadedTreebankMetadataResponse {
    id: string;
    treebank_id: string;
    field: string;
    type: 'text' | 'int' | 'date';
    facet: 'checkbox' | 'slider' | 'date_range';
    min_value: string | null;
    max_value: string | null;
    show: '1' | '0';
}

// not quite sure what this is yet
interface UploadedTreebankShowResponse {
    basex_db: string;
    nr_sentences: string;
    nr_words: string;
    slug: string;
    title: string;
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

                try {
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
                                multiOption: !!treebank.multioption
                            },
                            metadata: treebank.metadata,
                            variants: treebank.variants ? Object.keys(treebank.variants) : ['default'],
                            componentGroups: Object.values(treebank.components).map<TreebankComponent>(component => ({
                                id: component.id,
                                selected: !component.disabled,
                                title: component.title,
                                description: component.description,
                                sentenceCount: component.sentences,
                                wordCount: component.words,
                                group: component.group || component.id,
                                variant: component.variant || 'default',
                                disabled: component.disabled || false
                            })).reduce((groups, component) => {
                                const group = groups.find(g => g.key === component.group);

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
                                key,
                                sentenceCount: new FuzzyNumber(0),
                                wordCount: new FuzzyNumber(0),
                                multiOption: !!treebank.multioption
                            })))
                        };
                    });
                } catch (error) {
                    console.warn(`Could not get treebanks from backend ${provider}: ${error.message}`);
                }
            }

            const uploadProvider = await this.configurationService.getUploadProvider();
            const uploadedCorpora: ConfiguredTreebanks[string] = treebanks[uploadProvider] = (treebanks[uploadProvider] || {});
            const uploadUrl = await this.configurationService.getUploadApiUrl('treebank');

            try {
                const response = await this.http.get<UploadedTreebankResponse[]>(uploadUrl).toPromise();

                for (const item of response) { try {
                    const components = await
                        this.configurationService.getUploadApiUrl('treebank/show/' + item.title)
                        .then(url => this.http.get<UploadedTreebankShowResponse[]>(url).toPromise());
                    const metadata = await
                        this.configurationService.getUploadApiUrl('treebank/metadata/' + item.title)
                        .then(url => this.http.get<UploadedTreebankMetadataResponse[]>(url).toPromise());

                    uploadedCorpora[item.title] = {
                        treebank: {
                            name: item.title,
                            title: item.title,
                            userId: parseInt(item.user_id, 10),
                            email: item.email,
                            uploaded: new Date(item.uploaded),
                            processed: new Date(item.processed),
                            isPublic: item.public === '1',
                            description: item.title,
                            multiOption: true,
                            provider: uploadProvider,
                            selected: false,
                        },
                        variants: ['default'],

                        componentGroups: components.map(subtree => ({
                            id: subtree.basex_db,
                            group: subtree.basex_db,
                            variant: 'default',
                            title: subtree.title,
                            sentenceCount: parseInt(subtree.nr_sentences, 10),
                            wordCount: parseInt(subtree.nr_words, 10),
                            selected: true,
                            disabled: false,
                            description: '',
                        }))
                        .map(component => ({
                            key: component.id, // see group property in TreebankComponent created above
                            components: { default: component },
                            sentenceCount: new FuzzyNumber(component.sentenceCount),
                            wordCount: new FuzzyNumber(component.wordCount)
                        })),

                        metadata: metadata.map(item => {
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
                        })
                    };
                } catch (error) {
                    console.warn(`Could not fetch metadata or components for uploaded corpus ${item.title}: ${error.message}`);
                } }
            } catch (error) {
                console.warn(`Could not fetch uploaded corporaL: ${error.message}`);
            }

            this.data = treebanks;
            this.treebanks.next({
                state: treebanks,
                origin: 'init'
            });
            this.loading = false;
        })();
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

    /**
     * Toggle a specific component, other components are untouched, unless corpus.multiOption is false,
     * in which case they are unselected
     */
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
            } else if (!tb.treebank.multiOption) {
                component.selected = false;
            }
        });

        this.treebanks.next({state: next, origin: 'user'});
    }

    /** Only if corpus.multiOption */
    selectAllComponents(provider: string, corpus: string, select: boolean) {
        const next = this.data;
        const tb = next[provider][corpus];
        if (!tb.treebank.multiOption) {
            return;
        }

        tb.componentGroups
            .flatMap((group: ComponentGroup) => Object.values(group.components))
            .forEach(component => component.selected = select);
        tb.treebank.selected = select;

        this.treebanks.next({state: next, origin: 'user'});
    }

    /**
     * Change selection on the provided components,
     * other components are not changed, unless !corpus.multiOption
     */
    selectComponents(provider: string, corpus: string, components: Array<{componentId: string, selected: boolean}>) {
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

        let hasMarked = false;
        const willMark = components.some(c => c.selected);

        tb.componentGroups
        .flatMap((group: ComponentGroup) => Object.values(group.components))
        .forEach(component => {
            const newState: boolean|undefined = selectionMap[component.id];
            if (tb.treebank.multiOption) {
                component.selected = newState != null ? newState : component.selected;
                return;
            }

            if (component.selected) {
                // only way this can stay selected is:
                // - it's the first selected component passed in
                // - there's no selected component passed in, and this is the first component we find that was already selected
                component.selected = (newState && !hasMarked) || !willMark;
            } else {
                // only way component can become selected is:
                // - it's the first selected component component passed in
                component.selected = newState && !hasMarked;
            }

            hasMarked = hasMarked || component.selected;
        });

        this.treebanks.next({state: next, origin: 'user'});
    }

    /** Apply all passed selections states, everything else is DESELECTED */
    async select(state?: ReturnType<typeof mapTreebanksToSelectionSettings>, origin: 'init'|'url'|'user' = 'url') {
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

        state.forEach(selection => {
            const tb = next[selection.provider][selection.corpus];
            // select only those components in the state.components
            const components = tb.componentGroups.flatMap(group => Object.values(group.components));
            let hasSelected = false;
            components.forEach(c => {
                c.selected = (tb.treebank.multiOption || !hasSelected) && selection.components.includes(c.id);
                hasSelected = hasSelected || c.selected;
            });

            tb.treebank.selected = hasSelected;
        });
        this.treebanks.next({state: next, origin});
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

export type SelectedTreebanks = Array<{
    provider: string,
    corpus: string,
    components: string[]
}>;

/**
 * Get an array of all selected treebank components, grouped by their parent treebank
 * @param treebanks
 */
export function mapTreebanksToSelectionSettings(treebanks: ConfiguredTreebanks): SelectedTreebanks {
    return Object.values(treebanks).flatMap(v => Object.values(v))
    .map(treebankData => ({
        treebank: treebankData.treebank,
        components: treebankData.componentGroups.flatMap(group => Object.values(group.components))
    }))
    .filter(v => v.treebank.selected && v.components.some(c => c.selected))
    .map(({treebank, components}) => ({
        provider: treebank.provider,
        corpus: treebank.name,
        components: components.filter(c => c.selected).map(c => c.id)
    }));
}
