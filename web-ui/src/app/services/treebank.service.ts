import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Treebank, TreebankInfo, TreebankMetadata } from '../treebank';

@Injectable()
export class TreebankService {
    constructor(private http: HttpClient) {
    }

    public async getMetadata(corpus: string): Promise<TreebankMetadata[]> {
        let data = await this.http.get<{
            id: string,
            treebank_id: string,
            field: string,
            type: 'text' | 'int' | 'date',
            facet: 'checkbox' | 'slider' |'date_range',
            min_value: string | null,
            max_value: string | null,
            show: '1' | '0'
        }[]>('/gretel-upload/index.php/api/treebank/metadata/' + corpus).toPromise();

        return data.map(item => {
            let metadata: TreebankMetadata = {
                id: parseInt(item.id),
                treebankId: parseInt(item.treebank_id),
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
        let data = await this.http.get<{
            email: string,
            id: string
            processed: string,
            public: "1" | "0",
            title: string,
            uploaded, string,
            user_id: string
        }[]>("/gretel-upload/index.php/api/treebank").toPromise();
        return data.map(item => {
            return {
                id: parseInt(item.id),
                title: item.title,
                userId: parseInt(item.user_id),
                email: item.email,
                uploaded: new Date(item.uploaded),
                processed: new Date(item.processed),
                isPublic: item.public == '1'
            };
        });
    }

    async getSubTreebanks(treebankInfo: { title: string }): Promise<TreebankInfo[]> {
        let results = await this.http.get<{
            basex_db: string,
            nr_sentences: string,
            nr_words: string,
            slug: string,
            title: string
        }[]>(`/gretel-upload/index.php/api/treebank/show/${treebankInfo.title}`).toPromise();
        return results.map(x => {
            return {
                databaseId: x.basex_db,
                component: x.slug.toUpperCase(),
                sentenceCount: parseInt(x.nr_sentences),
                wordCount: parseInt(x.nr_words)
            }
        });
    }


}
