///<reference path="pivottable.d.ts"/>
import * as $ from 'jquery';
import 'pivottable';
import 'pivottable/dist/export_renderers';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export class FileExportRenderer {
    private tsvRenderer: PivotRenderer;

    constructor() {
        this.tsvRenderer = $.pivotUtilities.export_renderers['TSV Export'];
    }

    public render: PivotRenderer = (pivotData: any, opts: any) => {
        let tsvElement = this.tsvRenderer(pivotData, opts);
        let tsvFile = tsvElement.text();

        let excelButton = $('<button>Download Excel File</button>');
        excelButton.click(() => {
            this.downloadExcel(tsvFile);
        });

        let tsvButton = $('<button>Download TSV-File</button>');
        tsvButton.click(() => {
            this.downloadTsv(tsvFile);
        });

        let container = $('<div class="btn-wrapper"></div>');
        container.append(...[excelButton, tsvButton]);

        return container;
    }

    private downloadExcel(tsvFile: string) {
        let tsvData: string[][] = [];
        for (let line of tsvFile.split('\n')) {
            tsvData.push(line.split('\t'));
        }

        let workSheet = XLSX.utils.aoa_to_sheet(tsvData);
        let workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, 'Analysis');

        let workBookOutput = XLSX.write(workBook, { bookType: 'xlsx', type: 'binary' });

        saveAs(new Blob([this.stringToArrayBuffer(workBookOutput)]), 'export.xlsx');
    }

    private downloadTsv(tsvFile: string) {
        saveAs(new Blob([tsvFile], { type: "text/plain;charset=utf-8" }), 'export.tsv');
    }

    /**
     * Convert a string to an array buffer
     * @see https://github.com/SheetJS/js-xlsx/blob/master/demos/angular2/src/app/sheetjs.component.ts
     * @param s Input string to convert
     */
    private stringToArrayBuffer(s: string): ArrayBuffer {
        const buffer: ArrayBuffer = new ArrayBuffer(s.length);
        const view: Uint8Array = new Uint8Array(buffer);
        for (let i = 0; i !== s.length; ++i) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buffer;
    }
}
