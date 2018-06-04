///<reference path="pivottable.d.ts"/>
import { Component, Input, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/sortable';
import 'pivottable';

import { ExtractinatorService, PathVariable } from 'lassy-xpath/ng';

import { AnalysisService, ResultsService, TreebankService, Hit } from '../../services/_index';
import { FileExportRenderer } from './file-export-renderer';

@Component({
    selector: 'grt-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
    public variables: PathVariable[];
    public isLoading = true;
    public addVariable?: {
        variable: PathVariable,
        axis: 'row' | 'col'
    };

    @Input()
    public corpus: string;

    @Input()
    public components: string[];

    @Input()
    public xpath: string;

    constructor(private analysisService: AnalysisService,
        private extractinatorService: ExtractinatorService,
        private resultsService: ResultsService,
        private treebankService: TreebankService,
        private ngZone: NgZone) {
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

    private makeDraggable() {
        $('.path-variable').draggable({
            appendTo: "body",
            connectToSortable: ".pvtHorizList,.pvtRows",
            drag: (event, ui) => {
                ui.helper.css('cursor', 'move').addClass('tag');
            },
            stop: (event, ui) => {
                setTimeout(() => {
                    if ($('.pvtHorizList').find(ui.helper).length) {
                        this.showVariableToAdd(ui.helper, 'col');
                    }
                });
                setTimeout(() => {
                    if ($('.pvtRows').find(ui.helper).length) {
                        this.showVariableToAdd(ui.helper, 'row');
                    }
                });
            },
            helper: "clone",
            revert: true
        });
    }

    private showVariableToAdd(helper: JQuery<HTMLElement>, axis: 'row' | 'col') {
        console.log('shoooow');
        let variableName = helper.data('variable');
        helper.remove();
        this.ngZone.run(() => {
            console.log(variableName);
            console.log(this.variables);
            console.log(this.variables.find(v => v.name === variableName));
            this.addVariable = {
                axis,
                variable: this.variables.find(v => v.name === variableName)
            }
        });
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

        this.makeDraggable();

        this.isLoading = false;
    }

    private pivot(element: JQuery, metadataKeys: string[], hits: Hit[]) {
        let utils = $.pivotUtilities;
        let heatmap = utils.renderers["Heatmap"];
        let renderers = $.extend($.pivotUtilities.renderers,
            { 'File export': (new FileExportRenderer()).render });
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
            });
    }
}
