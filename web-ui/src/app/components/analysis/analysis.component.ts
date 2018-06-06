///<reference path="pivottable.d.ts"/>
import {Component, Input, OnInit} from '@angular/core';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-ui/ui/widgets/sortable';
import 'pivottable';

import {ExtractinatorService, PathVariable} from 'lassy-xpath/ng';

import {AnalysisService, ResultsService, TreebankService, Hit} from '../../services/_index';
import {FileExportRenderer} from './file-export-renderer';

@Component({
    selector: 'grt-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
    private variables: PathVariable[];
    public isLoading = true;

    @Input()
    public corpus: string;

    @Input()
    public components: string[];

    @Input()
    public xpath: string;

    count: number;

    constructor(private analysisService: AnalysisService,
                private extractinatorService: ExtractinatorService,
                private resultsService: ResultsService,
                private treebankService: TreebankService) {
        this.count = 0;
    }

    ngOnInit() {
        let $element = $('.analysis-component');
        this.initialize();
        this.show($element);
    }

    private initialize() {
        // TODO: on change
        // skip the $node variable, this is already defined in the query
        this.variables = this.extractinatorService.extract(this.xpath).filter(v => v.name != '$node');
    }

    private async show(element: JQuery<HTMLElement>) {
        this.isLoading = true;
        try {
            let [metadata, hits] = await Promise.all([
                this.treebankService.getMetadata(this.corpus),
                this.resultsService.promiseAllResults(this.xpath, this.corpus, this.components, false, true, [], this.variables)
            ]);

            this.pivot(element, metadata.map(m => m.field), hits);

        } catch (error) {
            // TODO: improved error notification
            console.error(error);
        }

        this.isLoading = false;
    }

    private pivot(element: JQuery, metadataKeys: string[], hits: Hit[]) {
        let utils = $.pivotUtilities;
        let heatmap = utils.renderers["Heatmap"];
        let renderers = $.extend($.pivotUtilities.renderers,
            {'File export': (new FileExportRenderer()).render});
        let pivotData = this.analysisService.getFlatTable(hits, this.variables.map(x => x.name), metadataKeys);
        // Show a default pivot using the first node variable's lemma property against the POS property.
        // This way the user will get to see some useable values to help clarify the interface.
        let defaultVariable = this.variables.length > 0 ? [this.variables[0].name.substr(1)] : [];
        return element.pivotUI(
            pivotData, {
                aggregators: {
                    'Count': utils.aggregators['Count'],
                    'Count Unique Values': utils.aggregators['Count Unique Values'],
                    'Count as Fraction of Columns': utils.aggregators['Count as Fraction of Columns'],
                    'Count as Fraction of Total': utils.aggregators['Count as Fraction of Total'],
                    'First': utils.aggregators['First'],
                    'Last': utils.aggregators['Last']
                },
                rows: defaultVariable.map(v => `lem_${v}`),
                cols: defaultVariable.map(v => `pos_${v}`),
                renderer: heatmap,
                renderers
            }).on('mouseup', () => this.addEvents());

    }

    private addEvents() {
        $('.pvtVal').off('click');
        $('.pvtVal').on('click', ($event) => {
            const parent = $event.currentTarget.parentNode;
            console.log(this.getElementByClass(parent.children,'pvtRowLabel'));

        } );
    }

    private getElementByClass(htmlCollection: HtmlCollection, className: string){
        const result = [];
        for(let i = 0; i < htmlCollection.length; i++){
            if($(htmlCollection[i]).hasClass(className)){
                result.push(htmlCollection[i])
            }
        }
        return result
    }
}
