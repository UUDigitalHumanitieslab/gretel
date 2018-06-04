import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { Hit } from './results.service';

@Injectable()
export class DownloadService {
    constructor(private sanitizer: DomSanitizer) {
    }

    public downloadDistributionList(counts: {
        component: string,
        hits: number,
        sentences: number
    }[]) {
        let rows = [this.formatCsvRow(['Component', 'Hits', 'All Sentences'])];
        for (let count of counts) {
            rows.push(this.formatCsvRow([count.component, count.hits, count.sentences]));
        }

        this.downloadRows('gretel-distribution.csv', 'text/csv', rows);
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

    public downloadXPath(xpath: string) {
        this.downloadRows('gretel-xpath.txt', 'text/plain', [xpath]);
    }

    private highlightSentence(highlightedSentence: SafeHtml) {
        return this.sanitizer.sanitize(SecurityContext.HTML, highlightedSentence)
            .replace(/<strong>/g, '<hit>')
            .replace(/<\/strong>/g, '</hit>');
    }

    private formatCsvRow(data: any[]) {
        return data.join(',') + '\n';
    }

    private downloadRows(filename: string, fileType: "text/csv" | "text/plain", rows: string[]) {
        saveAs(new Blob(rows, { type: `${fileType};charset=utf-8` }), filename);
    }
}
