///<reference path="pivottable.d.ts"/>
///<reference types="jqueryui"/>
import { Component, Input, OnDestroy, OnInit, NgZone } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/sortable';
import 'pivottable';

import { ExtractinatorService, PathVariable, XPathAttribute, ReconstructorService } from 'lassy-xpath/ng';

import { AnalysisService, ResultsService, TreebankService, Hit } from '../../services/_index';
import { FileExportRenderer } from './file-export-renderer';
import { TreebankMetadata } from '../../treebank';

@Component({
    selector: 'grt-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit {
    left: number;
    top: number;
    private $element: JQuery<HTMLElement>;
    private pivotUiOptions: PivotUiOptions;
    private hits: Hit[];
    private metadata: TreebankMetadata[];

    public variables: PathVariable[];
    public treeXml: string;
    public treeDisplay = 'inline';

    public isLoading = true;
    public selectedVariable?: SelectedVariable;

    public selectedVariables: SelectedVariable[];

    @Input()
    public corpus: string;

    @Input()
    public components: string[];

    @Input()
    public xpath: string;

    public attributes: { value: string, label: string }[];

    constructor(private analysisService: AnalysisService,
        private extractinatorService: ExtractinatorService,
        private reconstructorService: ReconstructorService,
        private resultsService: ResultsService,
        private treebankService: TreebankService,
        private ngZone: NgZone) {
    }

    ngOnInit() {
        this.$element = $('.analysis-component');
        this.initialize();
        this.show(this.$element);
    }

    private initialize() {
        // TODO: on change
        this.variables = this.extractinatorService.extract(this.xpath);
        this.treeXml = this.reconstructorService.construct(this.variables, this.xpath);

        // Show a default pivot using the first node variable's lemma property against the POS property.
        // This way the user will get to see some useable values to help clarify the interface.
        if (this.variables.length > 0) {
            let firstVariable = this.variables[this.variables.length > 1 ? 1 : 0];
            this.selectedVariables = [{
                attribute: 'pt',
                axis: 'row',
                variable: firstVariable
            }, {
                attribute: 'lemma',
                axis: 'col',
                variable: firstVariable
            }];

            let utils = $.pivotUtilities;
            let heatmap = utils.renderers["Heatmap"];
            let renderers = $.extend($.pivotUtilities.renderers,
                { 'File export': (new FileExportRenderer()).render });

            this.pivotUiOptions = {
                aggregators: {
                    'Count': utils.aggregators['Count'],
                    'Count Unique Values': utils.aggregators['Count Unique Values'],
                    'Count as Fraction of Columns': utils.aggregators['Count as Fraction of Columns'],
                    'Count as Fraction of Total': utils.aggregators['Count as Fraction of Total'],
                    'First': utils.aggregators['First'],
                    'Last': utils.aggregators['Last']
                },
                rows: [firstVariable.name + '.pt'],
                cols: [firstVariable.name + '.lemma'],
                renderer: heatmap,
                renderers,
                onRefresh: (data) => {
                    this.pivotUiOptions = data;
                }
            }
        } else {
            this.selectedVariables = [];
        }
    }

    private makeDraggable() {
        $('.path-variable,.tree-visualizer li[data-varname]').draggable({
            appendTo: "body",
            connectToSortable: ".pvtHorizList,.pvtRows",
            stop: (event, ui) => {
                if ($('.pvtHorizList').find(ui.helper).length) {
                    this.showVariableToAdd(ui.helper, 'col');
                }
                if ($('.pvtRows').find(ui.helper).length) {
                    this.showVariableToAdd(ui.helper, 'row');
                }
            },
            helper: (event) => {
                let data = $(event.currentTarget).data();
                let variable = data['variable'] || data['varname'];
                return $(`<li class="tag">${variable}</li>`).css('cursor', 'move');
            },
            revert: true
        });
    }

    public cancelVariable() {
        this.selectedVariable = undefined;
    }

    public async addVariable() {
        this.selectedVariables.push(this.selectedVariable);
        this.pivotUiOptions[this.selectedVariable.axis == 'row' ? 'rows' : 'cols']
            .push(`${this.selectedVariable.variable.name}.${this.selectedVariable.attribute}`);
        this.selectedVariable = undefined;
        this.$element.empty();
        this.show(this.$element);
    }

    private showVariableToAdd(helper: JQuery<HTMLElement>, axis: 'row' | 'col') {
        let variableName = helper.text().trim();
        let offset = $('.pvtRendererArea').offset();
        this.top = offset.top;
        this.left = offset.left;

        helper.remove();

        // only work with available attributes
        let attributes = this.analysisService.getVariableAttributes(variableName, this.hits);

        this.ngZone.run(() => {
            // show the window to add a new variable for analysis
            this.attributes = attributes;
            let values = attributes.map(x => x.value);
            this.selectedVariable = {
                attribute: values.find(v => v == 'pt') || values.find(v => v == 'cat') || values[0],
                axis,
                variable: this.variables.find(v => v.name === variableName)
            };
        });
    }

    private async show(element: JQuery<HTMLElement>) {
        this.isLoading = true;
        try {
            if (!this.metadata || !this.hits) {
                [this.metadata, this.hits] = await Promise.all([
                    this.treebankService.getMetadata(this.corpus),
                    this.resultsService.promiseAllResults(this.xpath, this.corpus, this.components, false, true, [], this.variables)
                ]);
            }

            this.pivot(element, this.metadata.map(m => m.field), this.hits);
        } catch (error) {
            // TODO: improved error notification
            console.error(error);
        }

        this.makeDraggable();

        this.isLoading = false;
    }

    private pivot(element: JQuery, metadataKeys: string[], hits: Hit[]) {
        let variables = this.selectedVariables.reduce((grouped, s) => {
            grouped[s.variable.name]
                ? grouped[s.variable.name].push(s.attribute)
                : grouped[s.variable.name] = [s.attribute];
            return grouped;
        }, {});
        let pivotData = this.analysisService.getFlatTable(
            hits,
            variables,
            metadataKeys);
        element.empty();
        let table = $('<div>');
        element.append(table);
        table.pivotUI(pivotData, this.pivotUiOptions);
        $('.pvtUi').addClass('table is-bordered');
    }
}

type SelectedVariable = {
    attribute: string,
    variable: PathVariable,
    axis: 'row' | 'col'
}
