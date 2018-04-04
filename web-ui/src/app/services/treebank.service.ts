import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {HttpClient} from "@angular/common/http";


@Injectable()
export class TreebankService {

  constructor(private http: HttpClient) {
  }

  getTreebanks(): Observable<any> {
    //TODO: make a link service
    return this.http.get("/gretel-upload/index.php/api/treebank");

  }

  //TODO: make use of typechecking
  getTreebankInfo(treebankInfo: any) {
    return this.http.get(`/gretel-upload/index.php/api/treebank/show/${treebankInfo.title}`)
  }
}
