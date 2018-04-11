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
    getResultsUrl: string;
    resultPostUrl: string;

    constructor(private http: HttpClient, private sessionService: SessionService) {
        this.getResultsUrl = '/gretel/basex-search-scripts/get-all-results.php';
        this.resultPostUrl = '/gretel/xps/results.php';

    }

    /***
     * Get all the results from the treebank and the subtreebanks.
     * WARNING: this function presiumes that you already posted the xpath query to the server.
     * TODO: update this function such that you can also just give an xpath query
     * @param treebank: the main treebank to search in
     * @param subTreebanks: the subtreebanks to search in
     * @returns Observable with will provide the results in one batch
     */
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
                'responseType': 'document'
            })
        };
        let options = new RequestOptions();
        //options.withCredentials = true;

        return new Observable((observer) => {
            this.http.post(this.resultPostUrl, formData, {'responseType': 'document'}).subscribe((res) => {

                },
                (e) => {
                },
                (done) => {
                    this.http.get(`${this.getResultsUrl}?sid=${id}`, {"withCredentials": true}).map((res: any) => {
                        let data = Object.keys(res.data).map((key: any) => {
                            let entry = res.data[key];
                            let id = this.get_innerhtml_from_a_tag(entry[0]);
                            let link = this.get_link_from_a_tag(entry[0]);
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


    /**
     * Gets the innerhtml of an a tag
     * @param tag: tag that contains innerhtml
     * @returns {string} containing the innerhtml of the a tag
     */
    get_innerhtml_from_a_tag(tag: string) {
        let start = tag.indexOf(">");
        let end = tag.lastIndexOf("<");
        return tag.substring(start + 1, end);
    }

    /**
     * Gets the link from the tag
     * @param tag to get the link from
     * @returns {string} containing the href from the tag
     */
    get_link_from_a_tag(tag: string) {
        let search_string = "href=\"";
        let start = tag.indexOf(search_string);
        let end = tag.indexOf("\" target");
        let skip_length = search_string.length;
        return tag.substring(start + skip_length, end)
    }
}
