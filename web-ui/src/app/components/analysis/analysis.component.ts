///<reference path="pivottable.d.ts"/>
///<reference types="jqueryui"/>
import { Component, Input, OnDestroy, OnInit, NgZone } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, combineLatest } from 'rxjs';
import { map, take } from 'rxjs/operators';

import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/sortable';
import 'pivottable';

import { ExtractinatorService, PathVariable, ReconstructorService } from 'lassy-xpath/ng';

import { AnalysisService, ResultsService, TreebankService, Hit, mapTreebanksToSelectionSettings, mapToTreebankArray } from '../../services/_index';
import { FileExportRenderer } from './file-export-renderer';
import { TreebankMetadata } from '../../treebank';

// TODO selected treebanks need to be reactive?
// TODO use something other than the first results

@Component({
    selector: 'grt-analysis',
    templateUrl: './analysis.component.html',
    styleUrls: ['./analysis.component.scss']
})
export class AnalysisComponent implements OnInit, OnDestroy {
    left: number;
    top: number;
    private $element: JQuery<HTMLElement>;
    private pivotUiOptions: PivotUiOptions;
    private data: {
        [provider: string]: {
            [corpus: string]: {
                metadata: TreebankMetadata[];
                hits: Hit[];
            }
        }
    };

    private selectedVariablesSubject = new BehaviorSubject<SelectedVariable[]>([]);

    public variables: PathVariable[];
    public treeXml: string;
    public treeDisplay = 'inline';

    public isLoading = true;
    public selectedVariable?: SelectedVariable;

    @Input()
    public xpath: string;

    public attributes: { value: string, label: string }[];

    private subscriptions: Subscription[];
    private cancellationToken = new Subject<{}>();

    constructor(
        private analysisService: AnalysisService,
        private extractinatorService: ExtractinatorService,
        private reconstructorService: ReconstructorService,
        private resultsService: ResultsService,
        private treebankService: TreebankService,
        private ngZone: NgZone
    ) {
    }

    ngOnInit() {
        this.$element = $('.analysis-component');
        this.initialize();
    }

    ngOnDestroy() {
        for (let subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.cancellationToken.next();
    }

    private async initialize() {
        // TODO: on change
        this.variables = this.extractinatorService.extract(this.xpath);
        this.treeXml = this.reconstructorService.construct(this.variables, this.xpath);

        // Show a default pivot using the first node variable's lemma property against the POS property.
        // This way the user will get to see some useable values to help clarify the interface.
        if (this.variables.length > 0) {
            let firstVariable = this.variables[this.variables.length > 1 ? 1 : 0];
            this.selectedVariablesSubject.next([{
                attribute: 'pt',
                axis: 'row',
                variable: firstVariable
            }, {
                attribute: 'lemma',
                axis: 'col',
                variable: firstVariable
            }]);

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
            this.selectedVariablesSubject.next([]);
        }

        const [treebankSelections, treebanks] = await combineLatest(
            this.treebankService.treebanks.pipe(map(v => mapTreebanksToSelectionSettings(v.state))),
            this.treebankService.treebanks.pipe(map(v => v.state))
        )
        .pipe(take(1))
        .toPromise();

        this.data = {};
        for (const {provider, corpus, components} of treebankSelections) {
            if (!this.data[provider]) {this.data[provider] = {}}
            this.data[provider][corpus] = {
                hits: await this.resultsService.promiseAllResults(this.xpath, provider, corpus, components.map(c => c.server_id), false, true, [], this.variables, this.cancellationToken),
                metadata: treebanks[provider][corpus].metadata
            }
        }

        this.subscriptions = [
            this.livePivot()
        ];
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
            helper: (event: Event) => {
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
        this.pivotUiOptions[this.selectedVariable.axis == 'row' ? 'rows' : 'cols']
            .push(`${this.selectedVariable.variable.name}.${this.selectedVariable.attribute}`);
        this.selectedVariablesSubject.next(this.selectedVariablesSubject.value.concat([this.selectedVariable]));
        this.selectedVariable = undefined;
    }

    private livePivot() {
        return this.selectedVariablesSubject.pipe(map((selectedVariables) => {
            this.show(this.$element, selectedVariables);
        })).subscribe();

    }

    private getFirstData() {
        return Object.values(Object.values(this.data)[0])[0]
    }

    private showVariableToAdd(helper: JQuery<HTMLElement>, axis: 'row' | 'col') {
        let variableName = helper.text().trim();
        let offset = $('.pvtRendererArea').offset();
        this.top = offset.top;
        this.left = offset.left;

        helper.remove();

        // only work with available attributes
        let attributes = this.analysisService.getVariableAttributes(variableName, this.getFirstData().hits);

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
    // TODO we use the first selected treebank
    private async show(element: JQuery<HTMLElement>, selectedVariables: SelectedVariable[]) {
        this.isLoading = true;
        try {


            this.pivot(element, this.getFirstData().metadata.map(m => m.field), this.getFirstData().hits, selectedVariables);
        } catch (error) {
            // TODO: improved error notification
            console.error(error);
        }

        this.makeDraggable();

        this.isLoading = false;
    }

    private pivot(element: JQuery, metadataKeys: string[], hits: Hit[], selectedVariables: SelectedVariable[]) {
        let variables = selectedVariables.reduce((grouped, s) => {
            grouped[s.variable.name]
                ? grouped[s.variable.name].push(s.attribute)
                : grouped[s.variable.name] = [s.attribute];
            return grouped;
        }, {} as {[variableName: string]: string[]});
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
