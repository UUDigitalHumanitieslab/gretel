import { Injectable } from '@angular/core';

@Injectable()
export class ConfigurationService {

  constructor() { }


    /**
     * Gets the base url that is used to get the xml files from
     * @returns {string}
     */
  getBaseUrlGretel(){
      return "http://localhost:8080/gretel";
  }

}
