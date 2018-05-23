import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import * as rxjs from 'rxjs';
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';
import { ConfigurationService } from "./configuration.service";

@Injectable()
export class AlpinoService {
    parseSentenceUrl: string;

    constructor(private http: HttpClient) {
        this.parseSentenceUrl = '/gretel/api/src/router.php/parse_sentence';
    }

    parseSentence(sentence: string): Observable<string> {
        return this.http.post(this.parseSentenceUrl, this.tokenize(sentence), { responseType: 'text' });
    }

    tokenize(sentence: string) {
        // Add space before and after punctuation marks
        return sentence.replace(/([<>\.\,\:\;\?!\(\)\"])/g, ' $1 ')
            // Deal wth ...
            .replace(/(\.\s+\.\s+\.)/g, ' ... ')
            // Delete first and last space(s)
            .replace(/^\s*(.*?)\s*$/g, '$1')
            // Change multiple spaces to single space
            .replace(/\s+/g, ' ');
    }
}
