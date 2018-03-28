import {Injectable} from '@angular/core';
import * as _ from 'lodash';
import {Result} from "../result";
import * as Rx from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {RequestOptions} from "@angular/http";
@Injectable()
export class DataService {

    data: Result[];

    constructor(private http: HttpClient) {
        this.data = [];
        for (const i of _.range(100)) {
            this.data.push(
                {
                    id: i,
                    component: 'AAA',
                    sentence: 'some random sentence',

                }
            );
        }
    }

    getResults(): Observable<Result[]> {

        const httpOptions = {
            headers: new HttpHeaders({
                'responseType': 'application/xml'
            })
        };
        let options = new RequestOptions();
        //options.withCredentials = true;

        return this.http.get("http://localhost:8080/gretel//basex-search-scripts/get-all-results.php?sid=e9bpdt5h71ksjosk4n2j3piho0-1522248767", {"withCredentials": true})
            .map((res: any) => {
                let data = Object.keys(res.data).map((key: any) => {
                    let entry = res.data[key];
                    let id = this.get_id_from_text(entry[0]);
                    console.log(entry[0]);
                    let link = this.get_link_from_text(entry[0]);
                    console.log(link);
                    return {
                        id: id,
                        component: entry[2],
                        sentence: entry[1],
                        link: link
                    }
                });
                return data
            })

        /*
         return Rx.Observable.interval(100)
         .map((c: number) => this.data[c])
         .take(this.data.length);
         */
    }


    get_id_from_text(text: string) {
        let start = text.indexOf(">");
        let end = text.lastIndexOf("<");
        return text.substring(start + 1, end);
    }

    get_link_from_text(text: string){
        let start = text.indexOf("href=\"");
        let end = text.indexOf("\" target");
        console.log(start)
        console.log(end)
        return text.substring(start + 6, end)
    }
}
