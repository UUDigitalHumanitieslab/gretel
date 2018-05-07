import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Treebank, TreebankInfo } from '../treebank';

@Injectable()
export class TreebankService {
    constructor(private http: HttpClient) {
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
