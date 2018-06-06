///<reference path="pivottable.d.ts"/>

///<reference types="jqueryui"/>
import {Component, Input, OnDestroy, OnInit, NgZone} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';

import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/sortable';
import 'pivottable';


import {ExtractinatorService, PathVariable, XPathAttribute, XpathAttributes} from 'lassy-xpath/ng';

import {AnalysisService, ResultsService, TreebankService, Hit} from '../../services/_index';
import {FileExportRenderer} from './file-export-renderer';
import {TreebankMetadata} from '../../treebank';


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
    public isLoading = true;
    public selectedVariable?: SelectedVariable;

    public selectedVariables: SelectedVariable[];

    @Input()
    public corpus: string;

    @Input()
    public components: string[];

    @Input()
    public xpath: string;


    public attributes = Object.keys(XpathAttributes).map(p => {
        let description = XpathAttributes[p].description;
        return {
            value: p,
            label: description ? `${p} (${description})` : p
        };
    });

    constructor(private analysisService: AnalysisService,
                private extractinatorService: ExtractinatorService,
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

        // Show a default pivot using the first node variable's lemma property against the POS property.
        // This way the user will get to see some useable values to help clarify the interface.
        if (this.variables.length > 0) {
            let firstVariable = this.variables[0];
            this.selectedVariables = [{
                attribute: 'pos',
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
                {'File export': (new FileExportRenderer()).render});

            this.pivotUiOptions = {
                aggregators: {
                    'Count': utils.aggregators['Count'],
                    'Count Unique Values': utils.aggregators['Count Unique Values'],
                    'Count as Fraction of Columns': utils.aggregators['Count as Fraction of Columns'],
                    'Count as Fraction of Total': utils.aggregators['Count as Fraction of Total'],
                    'First': utils.aggregators['First'],
                    'Last': utils.aggregators['Last']
                },
                rows: [firstVariable.name + '.pos'],
                cols: [firstVariable.name + '.lemma'],
                renderer: heatmap,
                renderers,
                onRefresh: (data) => {
                    this.pivotUiOptions = data;
                    this.addEvents();
                }
            }
        } else {
            this.selectedVariables = [];
        }
    }

    private makeDraggable() {
        $('.path-variable').draggable({
            appendTo: "body",
            connectToSortable: ".pvtHorizList,.pvtRows",
            drag: (event, ui) => {
                ui.helper.css('cursor', 'move').addClass('tag');
            },
            stop: (event, ui) => {
                if ($('.pvtHorizList').find(ui.helper).length) {
                    this.showVariableToAdd(ui.helper, 'col');
                }
                if ($('.pvtRows').find(ui.helper).length) {
                    this.showVariableToAdd(ui.helper, 'row');
                }
            },
            helper: "clone",
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
        let variableName = helper.data('variable');
        let offset = $('.pvtRendererArea').offset();
        this.top = offset.top;
        this.left = offset.left;

        helper.remove();
        this.ngZone.run(() => {
            // show the window to add a new variable for analysis
            this.selectedVariable = {
                attribute: 'pos',
                axis,
                variable: this.variables.find(v => v.name === variableName)
            }
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

    private addEvents() {
        $('.pvtVal').off('click');
        $('.pvtVal').on('click', ($event) => {
            const parent = $event.currentTarget.parentElement;
            console.log(this.getElementByClass(parent.children,'pvtRowLabel'));

        } );
    }

    private getElementByClass(htmlCollection: HTMLCollection, className: string) {

        const result = [];
        for (let i = 0; i < htmlCollection.length; i++) {
            if ($(htmlCollection[i]).hasClass(className)) {
                result.push(htmlCollection[i])
            }
        }
        return result
    }
}

type SelectedVariable = {
    attribute: string,
    variable: PathVariable,
    axis: 'row' | 'col'
}
