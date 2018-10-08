///<reference path="pivottable.d.ts"/>
///<reference types="jqueryui"/>
import { Component, Input, OnDestroy, OnInit, NgZone } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import * as $ from 'jquery';
import 'jquery-ui/ui/widgets/draggable';
import 'jquery-ui/ui/widgets/sortable';
import 'pivottable';

import { ExtractinatorService, PathVariable, ReconstructorService, XPathAttribute, XpathAttributes } from 'lassy-xpath/ng';

import {AnalysisService, ResultsService, TreebankService, Hit} from '../../services/_index';
import {FileExportRenderer} from './file-export-renderer';
import {TreebankMetadata} from '../../treebank';


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
    private hits: Hit[];
    private metadata: TreebankMetadata[];
    private selectedVariablesSubject = new BehaviorSubject<SelectedVariable[]>([]);

    public variables: PathVariable[];
    public treeXml: string;
    public treeDisplay = 'inline';

    public isLoading = true;
    public selectedVariable?: SelectedVariable;

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

    private subscriptions: Subscription[];
    private cancellationToken = new Subject<{}>();

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
        this.subscriptions = [
            this.livePivot()
        ];
    }

    ngOnDestroy() {
        for (let subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.cancellationToken.next();
    }

    private initialize() {
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
                rows: [firstVariable.name + '.pt'],
                cols: [firstVariable.name + '.lemma'],
                renderer: heatmap,
                renderers,
                onRefresh: (data) => {
                    this.pivotUiOptions = data;
                    this.addTableClickEvent();
                }
            }
        } else {
            this.selectedVariablesSubject.next([]);
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

    private async show(element: JQuery<HTMLElement>, selectedVariables: SelectedVariable[]) {
        this.isLoading = true;
        try {
            if (!this.metadata || !this.hits) {
                [this.metadata, this.hits] = await Promise.all([
                    this.treebankService.getMetadata(this.corpus),
                    this.resultsService.promiseAllResults(this.xpath, this.corpus, this.components, false, true, [], this.variables, this.cancellationToken)
                ]);
            }

            this.pivot(element, this.metadata.map(m => m.field), this.hits, selectedVariables);
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


    private getRowFilters(element: HTMLElement) {
        const rows = this.getRowElements(element);
        return this.getValueFromFilters(rows, this.getRowIndex(element), 'rowSpan');
    }

    private getColumnFilters(element: HTMLElement) {
        let columns = this.getColumnElements(element);
        return this.getValueFromFilters(columns, this.getColumnIndex(element), 'colSpan')
    }

    /**
     * Returns the value of the given filters, based on the given index and the spanname from which we must get the spanwidth
     * @param filters
     * @param index
     * @param spanName
     * @returns {{}}
     */
    private getValueFromFilters(filters, index: number, spanName: string){
        let results = {};
        for (let key in filters) {
            let values = filters[key];
            let spans = values.map(v => [v.innerHTML, v[spanName]]);
            let value = '';
            let total = 0;
            for (let span of spans) {
                total += span[1];
                if (index < total) {
                    value = span[0];
                    break;
                }
            }
            results[key] = value;
        }
        return results;
    }


    private getColumnIndex(element: HTMLElement) {
        return this.getNumberFromClass(element, 'col')

    }

    private getRowIndex(element: HTMLElement) {
        return this.getNumberFromClass(element, 'row')
    }

    private getNumberFromClass(element: HTMLElement, className: string): number {
        let name = Array.from(element.classList).filter((cName: string) => cName.includes(className))[0];
        return parseInt(name.replace(className, ''))
    }


    /**
     * Gets the columns by name containing the head elements
     *
     * @param element
     * @returns {string: HTMLElement[]}
     */
    private getColumnElements(element: HTMLElement) {
        let columns = {}
        let topRows = element.parentElement.parentElement.parentElement.childNodes[0];
        //Only use the last row.
        let rows = Array.from(topRows.childNodes).slice(0, topRows.childNodes.length - 1);
        for (let child of rows) {
            let newChild: any = child //To make sure there is no compile error
            let name = this.getElementByClass(newChild.children, 'pvtAxisLabel')[0].innerHTML;
            let children = this.getElementByClass(newChild.children, 'pvtColLabel');
            columns[name] = children;

        }
        return columns
    }


    private getRowElements(element: HTMLElement) {
        let rows = {}
        // First get the titles
        let head = element.parentElement.parentElement.parentElement.childNodes[0];
        let body = element.parentElement.parentElement.parentElement.childNodes[1];
        //Only use the last row.
        let headRows = Array.from(head.childNodes)[head.childNodes.length - 1];
        let bodyRows = Array.from(body.childNodes).slice(0, body.childNodes.length - 1);
        let titles = Array.from(headRows.childNodes).slice(0, headRows.childNodes.length - 1).map((e: HTMLElement) => e.innerHTML);
        let filters = {};
        for (let title of titles) {
            filters[title] = []
        }
        for (let row of bodyRows) {
            let tempRow: any = row
            let childElements = this.getElementByClass(tempRow.children, 'pvtRowLabel');

            let index = titles.length;
            for (let i = childElements.length -1 ; i >= 0; i--) {
                let element = childElements[i];
                index = index - 1;
                let title = titles[index];
                filters[title].push(element)
            }
        }
        return filters
    }

    private addTableClickEvent() {
        $('.pvtVal').off('click');
        $('.pvtVal').on('click', ($event) => {
            const element = $event.currentTarget;
            const rowFilters = this.getRowFilters(element);
            const columnFilters = this.getColumnFilters(element);

            //TODO: Add the routing to results page

        });
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
