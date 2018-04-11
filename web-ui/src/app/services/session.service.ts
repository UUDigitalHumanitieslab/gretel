import { Injectable } from '@angular/core';
import * as randomBytes from 'randombytes';
import {CookieService} from "angular2-cookie/core";


@Injectable()
export class SessionService {

  constructor(private cookieService: CookieService) { }



  public getSessionId(): string{
    return this.generateSessionId();
  }
  private generateId(len: number) {
    return randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);

  }

  private generateSessionId() {
    // the length of 50 is now a setting -> should be set somewhere central
    let id =this.cookieService.get("SessionId");

    if(!id){
      id = this.generateId(50)
      this.cookieService.put("SessionId", id);
      this.cookieService.put("PHPSESSID", id);
    }
    return id;
  }

}
