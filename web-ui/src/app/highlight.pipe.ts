import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { HighlightService } from './services/highlight.service';

@Pipe({
    name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer, private highlightService: HighlightService) {
    }

    /**
     * Transforms a text to highlight all the text matching the specified query.
     */
    transform(text: string, query: string) {
        let parts = this.highlightService.queryText(text, query);
        let highlightedText = parts.map(part => {
            let sanitizedText = this.sanitizedLineBreaks(part.text, "<br />");

            return part.isHit ? `<span class="highlight">${sanitizedText}</span>` : sanitizedText;
        }).join('');

        return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
    }

    private sanitizedLineBreaks(text: string, breakPlaceholder: string) {
        let substrings = text.split(/[\r\n]{1,2}/g);
        return substrings.map(substring => {
            return this.sanitizer.sanitize(SecurityContext.HTML, substring);
        }).join(breakPlaceholder);
    }
}
