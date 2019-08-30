import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, ReplaySubject, merge, of, from, zip } from 'rxjs';
import { flatMap, catchError, shareReplay, delay, map, filter, first } from 'rxjs/operators';

import {
    ComponentGroup,
    FuzzyNumber,
    Treebank,
    TreebankComponent,
    TreebankComponents,
    TreebankDetails,
    TreebankMetadata
} from '../treebank';
import { ConfigurationService } from './configuration.service';
import { NotificationService } from './notification.service';


export interface TreebankLookup {
    providers: { name: string, corpora: Set<string> }[];
    data: {
        [provider: string]: {
            [corpus: string]: Treebank;
        }
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
    public: '1' | '0';
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

class LazyRetrieve<T> {
    value?: Promise<T | undefined>;
    get(): Promise<T | undefined> {
        return this.value || (this.value = this.retriever()
            .catch((reason: HttpErrorResponse) => {
                NotificationService.addError(reason);
                return undefined;
            }));
    }

    constructor(private retriever: () => Promise<T>) {
        this.get = this.get.bind(this);
    }
}

abstract class TreebankBase implements Treebank {
    provider: string; id: string;
    displayName: string;
    description?: string;
    multiOption: boolean;
    isPublic: boolean;
    userId?: number;
    email?: string;
    uploaded?: Date;
    processed?: Date;
    details: { [T in keyof TreebankDetails]: () => Promise<TreebankDetails[T] | undefined> };
}

class LazyTreebank extends TreebankBase {
    constructor(
        values: Pick<Treebank, Exclude<keyof Treebank, 'details'>>,
        retrievers: {
            [T in keyof Treebank['details']]: Treebank['details'][T]
        }) {
        super();
        Object.assign(this, values);

        this.details = {
            metadata: new LazyRetrieve(retrievers.metadata).get,
            components: new LazyRetrieve(retrievers.components).get,
            componentGroups: new LazyRetrieve(retrievers.componentGroups).get,
            variants: new LazyRetrieve(retrievers.variants).get
        };
    }
}

export class ReadyTreebank extends TreebankBase {
    constructor(
        values: Pick<Treebank, Exclude<keyof Treebank, 'details'>>,
        details: TreebankDetails) {
        super();
        Object.assign(this, values);

        this.details = {
            metadata: () => Promise.resolve(details.metadata),
            components: () => Promise.resolve(details.components),
            componentGroups: () => Promise.resolve(details.componentGroups),
            variants: () => Promise.resolve(details.variants)
        };
    }
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
        sentenceCount: parseInt(comp.nr_sentences, 10),
        title: comp.title,
        wordCount: parseInt(comp.nr_words, 10),

        group: undefined,
        variant: undefined,
    };
}

function makeTreebank(provider: string, id: string, bank: ConfiguredTreebanksResponse[string]) {
    return {
        id,
        displayName: bank.title || id,
        description: bank.description || undefined,
        isPublic: true,
        multiOption: bank.multioption != null ? bank.multioption : true,
        provider
    };
}

function makeUploadedTreebank(provider: string, bank: UploadedTreebankResponse) {
    return {
        id: bank.title,
        displayName: bank.title,
        description: bank.title,
        isPublic: bank.public === '1',
        multiOption: true,
        provider,
        userId: parseInt(bank.user_id, 10),
        email: bank.email,
        uploaded: new Date(bank.uploaded),
        processed: new Date(bank.processed),
    };
}

function makeComponentGroup(id: string, description: string, components: TreebankComponent[]): ComponentGroup {
    const compsInGroup = components.filter(c => c.group === id && !!c.variant);

    return {
        components: compsInGroup.reduce<{ [variant: string]: string }>((items, comp) => {
            items[comp.variant] = comp.id;
            return items;
        }, {}),
        description,
        key: id,
        sentenceCount: compsInGroup.reduce((count, comp) => { count.add(comp.sentenceCount); return count; }, new FuzzyNumber(0)),
        wordCount: compsInGroup.reduce((count, comp) => { count.add(comp.wordCount); return count; }, new FuzzyNumber(0)),
    };
}

function makeTreebankInfo(provider: string, corpusId: string, bank: ConfiguredTreebanksResponse[string]): Treebank {
    const treebank = makeTreebank(provider, corpusId, bank);
    const components: TreebankComponent[] = Object.values(bank.components).map(makeComponent);
    const componentGroups: ComponentGroup[] | undefined = bank.groups
        ? Object.entries(bank.groups).map(([id, group]) => makeComponentGroup(id, group.description, components))
        : undefined;
    const variants: string[] | undefined = bank.variants ? Object.keys(bank.variants) : undefined;

    return new ReadyTreebank(
        treebank,
        {
            components: components.reduce<TreebankDetails['components']>((cs, c) => { cs[c.id] = c; return cs; }, {}),
            metadata: bank.metadata,
            variants,
            componentGroups,
        });
}

@Injectable()
export class TreebankService {
    /**
     * Use getTreebanks to start loading.
     * Some treebanks may become available here before it is done.
     */
    public readonly treebanks = new BehaviorSubject<TreebankLookup>({ providers: [], data: {} });

    private treebanksLoader: Promise<void>;

    constructor(private configurationService: ConfigurationService, private http: HttpClient) {
    }

    public async get(provider: string, corpus: string) {
        const get = (treebankLookup: TreebankLookup) => {
            const treebanks = treebankLookup.data[provider];
            return treebanks && treebanks[corpus];
        };

        return get(this.treebanks.value) || this.getTreebanks() && this.treebanks.pipe(
            map(treebanks => get(treebanks)),
            first(treebank => !!treebank)).toPromise();
    }

    /**
     * Completes when all providers have been queried.
     */
    public async getTreebanks(): Promise<TreebankLookup> {
        if (!this.treebanksLoader) {
            this.treebanksLoader = this.loadAll();
        }
        await this.treebanksLoader;
        return this.treebanks.value;
    }

    private async loadAll() {
        const allTreebanks$ = merge(this.getAllConfiguredTreebanks(), this.getUploadedTreebanks()).pipe(shareReplay()).pipe(delay(0));

        allTreebanks$.subscribe((treebank) => {
            if (treebank) {
                const current = this.treebanks.value;
                const provider = current.providers.find(p => p.name === treebank.provider);
                if (provider) {
                    provider.corpora.add(treebank.id);
                } else {
                    current.providers.push({ name: treebank.provider, corpora: new Set([treebank.id]) });
                }
                this.treebanks.next({
                    providers: current.providers,
                    data: {
                        ...current.data,
                        [treebank.provider]: {
                            ...current.data[treebank.provider],
                            [treebank.id]: treebank
                        }
                    }
                });
            }
        });

        // toPromise() resolves only when the underlying stream completes.
        await allTreebanks$.toPromise();
    }

    private getUploadedTreebanks(): Observable<Treebank> {
        const ob = new ReplaySubject<Treebank>();

        (async () => {
            const uploadProvider = await this.configurationService.getUploadProvider();
            const uploadUrl = await this.configurationService.getUploadApiUrl('treebank');

            this.http.get<UploadedTreebankResponse[]>(uploadUrl)
                .pipe(
                    // unpack array
                    flatMap(r => r),
                    // gather the rest of the data and unpack promise
                    map(r => this.getUploadedTreebank(uploadProvider, r)),
                    // catch errors (either from initial get, or the above async mapping operation)
                    catchError((error: HttpErrorResponse) => {
                        NotificationService.addError(error);
                        return undefined;
                    })
                )
                .subscribe(ob);
        })();

        return ob;
    }

    private getUploadedTreebank(provider: string, bank: UploadedTreebankResponse): Treebank {
        return new LazyTreebank(
            makeUploadedTreebank(provider, bank),
            {
                metadata: async () => {
                    const uploadedMetadata = await this.configurationService.getUploadApiUrl('treebank/metadata/' + bank.title)
                        .then(url => this.http.get<UploadedTreebankMetadataResponse[]>(url).toPromise());
                    return uploadedMetadata.map(makeUploadedMetadata);
                },
                componentGroups: async () => undefined,
                components: async () => {
                    const uploadedComponents = await this.configurationService.getUploadApiUrl('treebank/show/' + bank.title)
                        .then(url => this.http.get<UploadedTreebankShowResponse[]>(url).toPromise());

                    const components: TreebankComponent[] = uploadedComponents.map(makeUploadedComponent);
                    return components.reduce<TreebankComponents>((cs, c) => { cs[c.id] = c; return cs; }, {});
                },
                variants: async () => undefined
            });
    }

    /**
     * Request treebanks for all providers (except the user-uploaded ones),
     * process them, and yield them one by one.
     */
    private getAllConfiguredTreebanks(): Observable<Treebank> {
        return from(this.configurationService.getProviders()).pipe(
            // unpack providers array
            flatMap(providers => providers),
            // get url for provider (wrap provider in array or zip will unpack the string into characters)
            flatMap(provider => zip([provider], this.configurationService.getApiUrl(provider, 'configured_treebanks'))),
            // get treebanks for provider
            flatMap(([provider, url]) => this.getConfiguredTreebanks(provider, url)),
            // unpack multiple treebank results into distinct messages
            flatMap(treebanks => treebanks),
        );
    }

    private async getConfiguredTreebanks(provider: string, url: string): Promise<Treebank[]> {
        return this.http.get<ConfiguredTreebanksResponse>(url).toPromise()
            .then(r => Object.entries(r).map(([id, bank]) => makeTreebankInfo(provider, id, bank)));
    }
}
