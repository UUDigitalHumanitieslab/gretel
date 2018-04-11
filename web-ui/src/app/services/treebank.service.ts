import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SessionService } from "./session.service";


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

    getTreebankInfo(treebankInfo: any) {
        return this.http.get(`/gretel-upload/index.php/api/treebank/show/${treebankInfo.title}`)
    }
}
