import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import * as Rx from "rxjs/Rx"
import {Treebank, TreebankInfo} from "../treebank";


@Injectable()
export class TreebankService {

  constructor() {
  }

  treebanks: Treebank[] = [
    {
      id: "1",
      title: "test_treebank",
    },
    {
      id: "2",
      title: "test_treebank2",
    }
  ];

  treebanksInfo: TreebankInfo[] = [
    {
      slug: "test_treebank",
      name: "first name",
      nrSentences: 2,
      nrWords: 200,
    },
    {
      slug: "test_treebank",
      name: "second name",
      nrSentences: 100,
      nrWords: 101,
    },
    {
      slug: "test_treebank",
      name: "third name",
      nrSentences: 3,
      nrWords: 8,
    },
    {
      slug: "test_treebank2",
      name: "first name",
      nrSentences: 20,
      nrWords: 21,
    },
  ];


  getTreebanks(): Observable<Treebank> {
    return Rx.Observable.from(this.treebanks);
  }

  getTreebankInfo(treebank: Treebank) {
    return Rx.Observable.from(
      this.treebanksInfo.filter((info: TreebankInfo) => info.slug == treebank.title)
    );
  }
}
