import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HighlightService {
    constructor() { }

    // TODO: use the highlight service from I-Analyzer and extract that as a library
    public queryText(text: string, query: string) {
        let index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index == -1) {
            return [{
                text,
                isHit: false
            }]
        }

        let endIndex = index + query.length;
        let start = text.substring(0, index);
        let match = text.substring(index, endIndex);
        let end = text.substring(endIndex);

        return [
            { text: start, isHit: false },
            { text: match, isHit: true },
            { text: end, isHit: false }
        ].filter(({ text }) => text.length);
    }
}
