import { Injectable } from '@angular/core';
import {Link, mainLinks} from "../links";


@Injectable()
export class LinkService {

  constructor() { }

  public getMainLinks(): Link[]{
    return mainLinks;
  }


}
