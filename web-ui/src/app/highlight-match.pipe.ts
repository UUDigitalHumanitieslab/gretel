import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { HighlightService } from './services/highlight.service';

@Pipe({
    name: 'highlightMatch'
})
export class HighlightMatchPipe implements PipeTransform {
    constructor(private highlightService: HighlightService) {
    }

    /**
     * Transforms a text to highlight all the text matching the specified query.
     */
    transform(text: string, query: string) {
        if (query.length === 0) {
            return true;
        } 
        
        if (text == undefined || text == null) {
            return false;
        }

        return this.highlightService.queryText(text, query).filter(part => part.isHit).length > 0;
    }
}
