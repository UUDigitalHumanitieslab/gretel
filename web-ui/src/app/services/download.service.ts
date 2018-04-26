import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { Hit } from './results.service';

@Injectable()
export class DownloadService {
    constructor(private sanitizer: DomSanitizer) {
    }
    public downloadResults(corpus: string, components: string[], xpath: string, hits: Hit[]) {
        let rows: string[] = [];
        rows.push(
            `Corpus: ${corpus}
Components: ${components.join('-')}
XPath: ${xpath.replace(/\n/g, '\t')}
Date: ${new Date()}

`        );

        for (let i = 0; i < hits.length; i++) {
            let hit = hits[i];
            rows.push(`${i + 1}\t${corpus}\t${hit.component}\t${this.highlightSentence(hit.highlightedSentence)}
`);
        }

        this.downloadRows('gretel-results.txt', 'text/plain', rows);
    }

    private highlightSentence(highlightedSentence: SafeHtml) {
        return this.sanitizer.sanitize(SecurityContext.HTML, highlightedSentence)
            .replace(/<strong>/g, '<hit>')
            .replace(/<\/strong>/g, '</hit>');
    }

    private downloadRows(filename: string, fileType: "text/csv" | "text/plain", rows: string[]) {
        saveAs(new Blob(rows, { type: `${fileType};charset=utf-8` }), filename);
    }
}
