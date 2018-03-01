import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import * as rxjs from 'rxjs';
import {HttpClient} from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';
@Injectable()
export class AlpinoService {

  constructor(private http: HttpClient) { }



  parseSentence(sentence: string): Observable<any>{
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',

      })
    };
    const url = 'http://localhost:8080/gretel/api/src/router.php/parse_sentence';
    return this.http.post(url, sentence);

  }

}
