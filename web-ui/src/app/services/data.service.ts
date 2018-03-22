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

  getData(): Observable<Result[]> {

    const httpOptions = {
      headers: new HttpHeaders({
        'responseType': 'application/xml'
      })
    };
    let options = new RequestOptions();
    //options.withCredentials = true;

    return this.http.get("http://localhost:8080/gretel//basex-search-scripts/get-all-results.php?sid=t66bosvmuf97j06vg6ldu2fec5-1521712207", {"withCredentials": true})
      .map((res: any) => {
      let data = Object.keys(res.data).map((key: any) => {
        let entry = res.data[key];
        entry[0] = this.get_id_from_text(entry[0]);

        return {
          id: entry[0],
          component: entry[2],
          sentence: entry[1],
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

}
