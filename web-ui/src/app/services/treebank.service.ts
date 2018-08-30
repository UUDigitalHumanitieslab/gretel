import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Treebank, SubTreebank, TreebankMetadata } from '../treebank';
import { ConfigurationService } from "./configuration.service";

type ConfiguredTreebanks = {
    [corpus: string]: {
        treebank: Treebank,
        subTreebanks: SubTreebank[],
        metadata: TreebankMetadata[]
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
            maxValue?: number | Date
        }[]
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
                    subTreebanks: Object.keys(treebank.components).map(key => {
                        let component = treebank.components[key];
                        return {
                            databaseId: component.database_id,
                            component: key,
                            title: component.title,
                            description: component.description,
                            sentenceCount: component.sentences,
                            wordCount: component.words
                        }
                    })
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

    async getSubTreebanks(treebankName: string): Promise<SubTreebank[]> {
        let configuredTreebank = (await this.getConfiguredTreebanks())[treebankName];
        if (configuredTreebank) {
            return configuredTreebank.subTreebanks;
        }

        let results = await this.http.get<{
            basex_db: string,
            nr_sentences: string,
            nr_words: string,
            slug: string,
            title: string
        }[]>(await this.configurationService.getUploadApiUrl(`treebank/show/${treebankName}`)).toPromise();
        return results.map(subtree => ({
            databaseId: subtree.basex_db,
            component: subtree.slug.toUpperCase(),
            title: subtree.title,
            sentenceCount: parseInt(subtree.nr_sentences),
            wordCount: parseInt(subtree.nr_words)
        }));
    }
}
