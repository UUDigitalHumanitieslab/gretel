import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SessionService } from "./session.service";
import { TreebankInfo } from '../treebank';


@Injectable()
export class TreebankService {

    constructor(private http: HttpClient, private sessionService: SessionService) {
    }

    getTreebanks(): Observable<any> {
        //TODO: make a link service
        return this.http.get("/gretel-upload/index.php/api/treebank");

    }

    preGetTreebanks(xpath: string): Observable<any> {
        let id = this.sessionService.getSessionId();

        const httpOptions = {
            headers: new HttpHeaders({
                'responseType': 'document'
            })
        };
        const formData = new FormData();
        formData.append("sid", id);
        formData.append("xpath", xpath);



        return this.http.post("/gretel/xps/tb-sel.php", formData, { headers: { responseType: "document" } })
    }

    async getSubTreebanks(treebankInfo: { title: string }): Promise<TreebankInfo[]> {
        let results = await this.http.get<[{
            basex_db: string,
            nr_sentences: string,
            nr_words: string,
            slug: string,
            title: string
        }]>(`/gretel-upload/index.php/api/treebank/show/${treebankInfo.title}`).toPromise();
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
