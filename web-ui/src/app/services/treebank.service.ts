import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Treebank, TreebankComponent, TreebankMetadata, ComponentGroup, FuzzyNumber } from '../treebank';
import { ConfigurationService } from './configuration.service';
import { BehaviorSubject, Observable, ReplaySubject, merge, of, from, zip } from 'rxjs';
import { flatMap, catchError, shareReplay, delay } from 'rxjs/operators';


export interface TreebankInfo {
    treebank: Treebank;
    metadata: TreebankMetadata[];

    components: { [id: string]: TreebankComponent };
    componentGroups?: ComponentGroup[];
    variants?: string[];
}

export interface ConfiguredTreebanks {
    [provider: string]: {
        [corpus: string]: TreebankInfo;
    };
}

export interface ConfiguredTreebanksResponse {
    [treebank: string]: {
        components: {
            [component: string]: {
                id: string,
                title: string,
                description: string,
                sentences: number | '?',
                words: number | '?',
                group?: string,
                variant?: string,
                disabled?: boolean
            }
        },
        groups?: {
            [group: string]: {
                description: string
            }
        },
        variants?: {
            [variant: string]: {
                display: string
            }
        },
        description: string,
        title: string,
        metadata: {
            field: string,
            type: 'text' | 'int' | 'date',
            facet: 'checkbox' | 'slider' | 'range' | 'dropdown',
            show: boolean,
            minValue?: number | Date,
            maxValue?: number | Date,
        }[],
        multioption?: boolean
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

interface TreebankSelection {
    provider: string;
    corpus: string;
    components: string[];
}

function makeUploadedMetadata(item: UploadedTreebankMetadataResponse): TreebankMetadata {
    const metadata: TreebankMetadata = {
        field: item.field,
        type: item.type,
        facet: item.facet === 'date_range' ? 'range' : item.facet,
        show: item.show === '1'
    };

    if (['slider', 'range'].includes(metadata.facet)) {
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
}

function makeComponent(comp: ConfiguredTreebanksResponse[string]['components'][string]): TreebankComponent {
    return {
        description: comp.description,
        disabled: !!comp.disabled,
        id: comp.id,
        selected: !comp.disabled,
        sentenceCount: comp.sentences,
        title: comp.title,
        wordCount: comp.words,

        group: comp.group || undefined,
        variant: comp.variant || undefined,
    };
}

function makeUploadedComponent(comp: UploadedTreebankShowResponse): TreebankComponent {
    return {
        description: '',
        disabled: false,
        id: comp.basex_db,
        selected: true,
        sentenceCount: parseInt(comp.nr_sentences, 10),
        title: comp.title,
        wordCount: parseInt(comp.nr_words, 10),

        group: undefined,
        variant: undefined,
    };
}

function makeTreebank(provider: string, id: string, bank: ConfiguredTreebanksResponse[string]): Treebank {
    return {
        id,
        displayName: bank.title || id,
        description: bank.description || undefined,
        isPublic: true,
        multiOption: bank.multioption != null ? bank.multioption : true,
        provider,
        selected: false,
    };
}

function makeUploadedTreebank(provider: string, bank: UploadedTreebankResponse): Treebank {
    return {
        id: bank.title,
        displayName: bank.title,
        description: bank.title,
        isPublic: bank.public === '1',
        multiOption: true,
        provider,
        selected: false,

        userId: parseInt(bank.user_id, 10),
        email: bank.email,
        uploaded: new Date(bank.uploaded),
        processed: new Date(bank.processed),
    };
}

function makeComponentGroup(id: string, description: string, components: TreebankComponent[]): ComponentGroup {
    const compsInGroup = components.filter(c => c.group === id && !!c.variant);

    return {
        components: compsInGroup.reduce<{[variant: string]: string}>((items, comp) => {
            items[comp.variant] = comp.id;
            return items;
        }, {}),
        description,
        key: id,
        sentenceCount: compsInGroup.reduce((count, comp) => { count.add(comp.sentenceCount); return count; }, new FuzzyNumber(0)),
        wordCount: compsInGroup.reduce((count, comp) => { count.add(comp.wordCount); return count; }, new FuzzyNumber(0)),
    };
}

function makeTreebankInfo(provider: string, corpusId: string, bank: ConfiguredTreebanksResponse[string]): TreebankInfo {
    const treebank = makeTreebank(provider, corpusId, bank);
    const components: TreebankComponent[] = Object.values(bank.components).map(makeComponent);
    const componentGroups: ComponentGroup[]|undefined = bank.groups
        ? Object.entries(bank.groups).map(([id, group]) => makeComponentGroup(id, group.description, components))
        : undefined;
    const variants: string[]|undefined = bank.variants ? Object.keys(bank.variants) : undefined;

    return {
        treebank,
        components: components.reduce<TreebankInfo['components']>((cs, c) => { cs[c.id] = c; return cs; }, {}),
        metadata: bank.metadata,
        variants,
        componentGroups,
    };
}

@Injectable()
export class TreebankService {
    public readonly treebanks = new BehaviorSubject<{
        state: ConfiguredTreebanks,
        origin: 'init'|'url'|'user'}
    >({ state: {}, origin: 'init'});

    /**
     * Completes when all providers have been queried.
     * Some treebanks may become available before this happens.
     */
    public readonly finishedLoading: Promise<void>;

    constructor(private configurationService: ConfigurationService, private http: HttpClient) {
        const allTreebanks$ = merge(this.getAllConfiguredTreebanks(), this.getUploadedTreebanks()).pipe(shareReplay()).pipe(delay(0));

        allTreebanks$.subscribe(({provider, result, error}) => {
            if (error) { console.warn(error.message); }
            if (result) {
                this.treebanks.next({
                    origin: 'init',
                    state: {
                        ...this.treebanks.value.state,
                        [provider]: {
                            ...this.treebanks.value.state[provider],
                            [result.treebank.id]: result
                        }
                    }
                });
            }
        });

        // toPromise() resolves only when the underlying stream completes. Attach an empty then() to hide the last emitted value.
        this.finishedLoading = allTreebanks$.toPromise().then(() => {});
    }

    private getUploadedTreebanks(): Observable<{
        provider: string;
        result?: TreebankInfo;
        error?: HttpErrorResponse;
    }> {
        const ob = new ReplaySubject<{
            provider: string;
            result?: TreebankInfo;
            error?: HttpErrorResponse;
        }>();

        (async () => {
            const uploadProvider = await this.configurationService.getUploadProvider();
            const uploadUrl = await this.configurationService.getUploadApiUrl('treebank');

            this.http.get<UploadedTreebankResponse[]>(uploadUrl)
            .pipe(
                // unpack array
                flatMap(r => r),
                // gather the rest of the data and unpack promise
                flatMap(r => this.getUploadedTreebank(uploadProvider, r)),
                // catch errors (either from initial get, or the above async mapping operation)
                catchError((error: HttpErrorResponse) => of({
                    provider: uploadProvider,
                    error
                }))
            )
            .subscribe(ob);
        })();

        return ob;
    }

    private getUploadedTreebank(provider: string, bank: UploadedTreebankResponse): Promise<{
        provider: string;
        result?: TreebankInfo;
        error?: HttpErrorResponse;
    }> {
        return Promise.all([
            this.configurationService.getUploadApiUrl('treebank/show/' + bank.title)
            .then(url => this.http.get<UploadedTreebankShowResponse[]>(url).toPromise()),

            this.configurationService.getUploadApiUrl('treebank/metadata/' + bank.title)
            .then(url => this.http.get<UploadedTreebankMetadataResponse[]>(url).toPromise())
        ])
        .then(
            ([uploadedComponents, uploadedMetadata]) => {
                const components: TreebankComponent[] = uploadedComponents.map(makeUploadedComponent);
                return {
                    provider,
                    result: {
                        componentGroups: undefined,
                        components: components.reduce<TreebankInfo['components']>((cs, c) => { cs[c.id] = c; return cs; }, {}),
                        metadata: uploadedMetadata.map(makeUploadedMetadata),
                        treebank: makeUploadedTreebank(provider, bank),
                        variants: undefined
                    }
                };
            },
            ((error: HttpErrorResponse) => ({
                provider,
                error
            }))
        );
    }

    /**
     * Request treebanks for all providers (except the user-uploaded ones),
     * process them, and yield them one by one.
     */
    private getAllConfiguredTreebanks(): Observable<{
        provider: string;
        result?: TreebankInfo;
        error?: HttpErrorResponse;
    }> {
        return from(this.configurationService.getProviders()).pipe(
            // unpack providers array
            flatMap(providers => providers),
            // get url for provider (wrap provider in array or zip will unpack the string into characters)
            flatMap(provider => zip([provider], this.configurationService.getApiUrl(provider, 'configured_treebanks'))),
            // get treebanks for provider
            flatMap(([provider, url]) => this.getConfiguredTreebanks(provider, url)),
            // unpack multiple treebank results into distinct messages
            flatMap(info => info.result ?
                info.result.map(tb => ({provider: info.provider, result: tb})) : // success, unpack
                [{provider: info.provider, error: info.error}] // failure, pass on error, (could cast and return info but this is clearer)
            ),
        );
    }

    private async getConfiguredTreebanks(provider: string, url: string): Promise<{
        provider: string,
        result?: TreebankInfo[],
        error?: HttpErrorResponse
    }> {
        return this.http.get<ConfiguredTreebanksResponse>(url).toPromise()
        .then(r => Object.entries(r).map(([id, bank]) => makeTreebankInfo(provider, id, bank)))
        .then(
            (result: TreebankInfo[]) => ({
                provider,
                result
            }),
            (error: HttpErrorResponse) => ({
                provider,
                error
            })
        );
    }


    // -------------------------------------
    // SELECTION
    // -------------------------------------

    /**
     * Waits until all treebanks are loaded, then applies the selection settings.
     * Any treebank passed in is selected, any component passed in is selected, everything else is deselected.
     * If the treebank is not multiOption, only the first provided component will be selected.
     * @param sel selections
     */
    public initSelections(sel: TreebankSelection[]) {
        // await initialization
        this.finishedLoading.then(() => {
            const state = this.treebanks.value.state;

            sel.filter(s => state[s.provider] && state[s.provider][s.corpus])
            .forEach(s => {
                const corpusInfo = state[s.provider][s.corpus];
                const components = corpusInfo.treebank.multiOption
                    ? s.components
                    : s.components.slice(0, 1);

                Object.values(corpusInfo.components)
                .forEach(component => component.selected = !component.disabled && components.includes(component.id));
                corpusInfo.treebank.selected = true;
            });

            this.treebanks.next({
                origin: 'init',
                state
            });
        });
    }

    /**
     * Set the selected state for this bank, or toggle it if no new state is provided.
     *
     * @param provider
     * @param corpus
     * @param selected
     */
    toggleCorpus(provider: string, corpus: string, selected?: boolean) {
        const next = this.treebanks.value.state;
        const tb = next[provider] && next[provider][corpus] ? next[provider][corpus] : undefined;
        if (!tb) {
            return;
        }

        tb.treebank.selected = selected != null ? selected : !tb.treebank.selected;
        this.treebanks.next({state: next, origin: 'user'});
    }

    /**
     * Set the selected state for this component, or toggle it if no new state is provided.
     * Other components are untouched, unless the bank does not support multiOption.
     * If no components are selected after toggling, the bank itself is also deselected.
     *
     * @param provider
     * @param corpus
     * @param selected
     */
    toggleComponent(provider: string, corpus: string, componentId: string, selected?: boolean) {
        const next = this.treebanks.value.state;
        const tb = next[provider] && next[provider][corpus] ? next[provider][corpus] : undefined;
        if (!tb || !tb.components[componentId] || tb.components[componentId].disabled) {
            return;
        }

        selected = selected != null ? selected : !tb.components[componentId].selected;
        let anySelected = false;
        Object.values(tb.components).forEach(c => {
            if (c.id === componentId) {
                c.selected = selected;
            } else if (!tb.treebank.multiOption) {
                c.selected = false;
            }

            anySelected = anySelected || c.selected;
        });

        tb.treebank.selected = anySelected;
        this.treebanks.next({state: next, origin: 'user'});
    }

    toggleComponents(provider: string, corpus: string, selected?: boolean) {
        const next = this.treebanks.value.state;
        const tb = next[provider] && next[provider][corpus] ? next[provider][corpus] : undefined;
        if (!tb) {
            return;
        }

        const componentsToSelect = Object.values(tb.components).filter(c => !c.disabled);
        selected = selected != null ? selected : !componentsToSelect.every(c => c.selected);
        Object.values(tb.components).forEach(c => c.selected = selected);
        if (!tb.treebank.multiOption) {
            componentsToSelect.slice(1).forEach(c => c.selected = false);
        }

        tb.treebank.selected = selected;
        this.treebanks.next({state: next, origin: 'user'});
    }

    /**
     * Set the selected state for all components in this group, or toggle it if no new state is provided.
     * Other components are untouched, unless the bank does not support multiOption.
     * If components are selected after toggling, the bank itself is also deselected.
     *
     * @param provider
     * @param corpus
     * @param selected
     */
    toggleComponentGroup(provider: string, corpus: string, group: string, selected?: boolean) {
        const next = this.treebanks.value.state;
        const tb = next[provider] && next[provider][corpus] ? next[provider][corpus] : undefined;
        const grp = tb.componentGroups.find(g => g.key === group);
        if (!tb || !grp) {
            return;
        }

        const componentsInGroup = Object.values(grp.components).filter(id => !tb.components[id].disabled);
        selected = selected != null ? selected : !componentsInGroup.every(id => tb.components[id].selected);
        componentsInGroup.forEach(id => tb.components[id].selected = selected);

        // keep only the first one in the group
        if (selected && !tb.treebank.multiOption) {
            componentsInGroup.slice(1).forEach(id => tb.components[id].selected = false);
        }

        tb.treebank.selected = Object.values(tb.components).some(c => c.selected);
        this.treebanks.next({state: next, origin: 'user'});
    }

    toggleVariant(provider: string, corpus: string, variant: string, selected?: boolean) {
        const next = this.treebanks.value.state;
        const tb = next[provider] && next[provider][corpus] ? next[provider][corpus] : undefined;

        if (!tb || !(tb.variants && tb.variants.includes(variant))) {
            return;
        }

        const componentsInVariant = tb.componentGroups.map(g => g.components[variant]).filter(id => !tb.components[id].disabled);
        selected = selected != null ? selected : !componentsInVariant.every(id => tb.components[id].selected);
        componentsInVariant.forEach(id => tb.components[id].selected = selected);
        if (selected && !tb.treebank.multiOption) {
            componentsInVariant.slice(1).forEach(id => tb.components[id].selected = false);
        }

        tb.treebank.selected = Object.values(tb.components).some(c => c.selected);
        this.treebanks.next({state: next, origin: 'user'});
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
    .filter(v => v.treebank.selected && Object.values(v.components).some(c => c.selected))
    .map(({treebank, components}) => ({
        provider: treebank.provider,
        corpus: treebank.id,
        components: Object.values(components).filter(c => c.selected).map(c => c.id)
    }));
}
