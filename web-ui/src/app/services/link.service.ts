import { Injectable } from '@angular/core';
import {Link, mainLinks} from "../app-routing/links";


@Injectable()
export class LinkService {

  constructor() { }

  public getMainLinks(): Link[]{
    return mainLinks;
  }


}
