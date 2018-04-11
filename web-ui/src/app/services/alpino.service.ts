import { Injectable } from '@angular/core';
import {Observable} from "rxjs/Observable";
import * as rxjs from 'rxjs';
import {HttpClient} from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';
import {ConfigurationService} from "./configuration.service";
@Injectable()
export class AlpinoService {
    parseSentenceUrl: string;

  constructor(private http: HttpClient) {
      this.parseSentenceUrl = '/api/src/router.php/parse_sentence';
  }

  parseSentence(sentence: string): Observable<any>{
    return this.http.post(this.parseSentenceUrl, sentence);

  }

}
