import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {Result} from "../result";
import * as Rx from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {RequestOptions} from "@angular/http";
import {SessionService} from "./session.service";
@Injectable()
export class ResultService {

    data: Result[];

    constructor(private http: HttpClient, private sessionService: SessionService) {
        this.data = [];

    }

    getResults(treebank, subTreebanks): Observable<Result[]> {
        let id = this.sessionService.getSessionId();
        const formData = new FormData();
        formData.append("sid", id);
        formData.append("treebank", treebank);
        for (let subTreebank of subTreebanks) {
            formData.append("subtreebank[]", subTreebank)
        }


        const httpOptions = {
            headers: new HttpHeaders({
                'responseType': 'application/xml'
            })
        };
        let options = new RequestOptions();
        //options.withCredentials = true;

        return new Observable((observer) => {
            this.http.post('/gretel/xps/results.php', formData, {'responseType': 'document'}).subscribe((res) => {

                },
                (e) => {
                },
                (done) => {
                    this.http.get(`http://localhost:8080/gretel//basex-search-scripts/get-all-results.php?sid=${id}`, {"withCredentials": true}).map((res: any) => {
                        console.log('Doe maar even  ook djoen')
                        let data = Object.keys(res.data).map((key: any) => {
                            let entry = res.data[key];
                            let id = this.get_id_from_text(entry[0]);
                            let link = this.get_link_from_text(entry[0]);
                            return {
                                id: id,
                                component: entry[2],
                                sentence: entry[1],
                                link: link
                            }
                        });
                        observer.next(data);
                        observer.complete();


                    }).subscribe()


                });
        })
    }



    get_id_from_text(text: string) {
        let start = text.indexOf(">");
        let end = text.lastIndexOf("<");
        return text.substring(start + 1, end);
    }

    get_link_from_text(text: string) {
        let start = text.indexOf("href=\"");
        let end = text.indexOf("\" target");
        return text.substring(start + 6, end)
    }
}
