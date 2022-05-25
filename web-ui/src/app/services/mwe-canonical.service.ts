import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MWECanonicalService {

    constructor() { }

    public get() : string[] {
        return [
            'this is one expression',
            'this is another expression',
            'this is great'
        ];
    }
}
