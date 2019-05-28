import { Injectable, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { saveAs } from 'file-saver';
import { Hit } from './results.service';
import * as JSZip from 'jszip';

@Injectable()
export class DownloadService {
    constructor(private sanitizer: DomSanitizer) {
    }

    public downloadDistributionList(counts: {
        provider: string,
        corpus: string,
        component: string,
        hits: number,
        sentences: string
    }[]) {
        const rows = [this.formatCsvRow('Provider', 'Treebank', 'Component', 'Hits', 'All Sentences')];
        for (const count of counts) {
            rows.push(this.formatCsvRow(count.provider, count.corpus, count.component, count.hits, count.sentences));
        }

        this.downloadRows('gretel-distribution.csv', 'text/csv', rows);
    }

    public async downloadResults(results: { corpus: string, components: string[], xpath: string, hits: Hit[] }[]) {
        const zip = new JSZip();
        const corporaNames: string[] = [];
        results.forEach(({ corpus, components, xpath, hits }) => {
            zip.file(
                `${corpus}.meta.txt`,
                this.blob(
                    'text/plain',
                    [`Corpus: ${corpus}
Components: ${components.join('-')}
XPath: ${xpath.replace(/\n/g, '\t')}
Date: ${new Date()}
`]));
            corporaNames.push(corpus);

            const rows: string[] = [this.formatCsvRow('#', 'ID', 'Corpus', 'Component', 'Sentence')];

            for (let i = 0; i < hits.length; i++) {
                const hit = hits[i];
                rows.push(this.formatCsvRow(
                    i + 1,
                    hit.fileId,
                    corpus,
                    hit.component,
                    this.highlightSentence(hit.highlightedSentence)));
            }

            zip.file(`${corpus}.csv`, this.blob('text/csv', rows));
        });
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `gretel-${corporaNames.join('-')}-${this.timestamp()}.zip`);
    }

    public downloadXPath(xpath: string) {
        this.downloadRows('gretel-xpath.txt', 'text/plain', [xpath]);
    }

    public downloadXml(filename: string, xml: string) {
        saveAs(new Blob([xml], { type: `text/xml;charset=utf-8` }), filename);
    }

    public downloadFilelist(filenames: string[], name: string, header?: string, extension: string = '.fl') {
        if (!header) {
            header = name;
        }
        saveAs(new Blob([`${header}\n${filenames.join('\n')}`], { type: 'text/txt' }), `${name}${extension}`);
    }

    private timestamp() {
        const now = new Date();
        return [now.getUTCFullYear(),
        (now.getUTCMonth() + 1).toString().padStart(2, '0'),
        now.getUTCDate().toString().padStart(2, '0'),
        now.getUTCHours().toString().padStart(2, '0'),
        now.getUTCMinutes().toString().padStart(2, '0'),
        now.getUTCSeconds().toString().padStart(2, '0'),
        ].join('');
    }

    private highlightSentence(highlightedSentence: SafeHtml) {
        return this.sanitizer.sanitize(SecurityContext.HTML, highlightedSentence)
            .replace(/<strong>/g, '<hit>')
            .replace(/<\/strong>/g, '</hit>');
    }

    private formatCsvRow(...data: any[]) {
        return data.join(',') + '\n';
    }

    private blob(fileType: 'text/csv' | 'text/plain', rows: string[]) {
        return new Blob(rows, { type: `${fileType};charset=utf-8`, endings: 'native' });
    }

    private downloadRows(filename: string, fileType: 'text/csv' | 'text/plain', rows: string[]) {
        saveAs(this.blob(fileType, rows), filename);
    }
}
