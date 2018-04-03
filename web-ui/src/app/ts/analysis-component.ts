///<reference path="definitions/pivottable.d.ts"/>
import { AnalysisService } from './services/analysis-service';
import { NotificationService } from './services/notification-service';
import { TreebankService } from './services/treebank-service';
import { SearchService, SearchResult } from './services/search-service';
import { FileExportRenderer } from './file-export-renderer';
import { PathVariable } from './xpath-extractinator';
import * as $ from 'jquery';
import 'jquery-ui';
import 'jquery-ui/ui/widgets/sortable';
import 'pivottable';

export class AnalysisComponent {
    variables: PathVariable[];
    apiUrl: string;
    corpus: string;
    treebankService: TreebankService;

    constructor(element: HTMLElement, private analysisService = new AnalysisService(), private notificationService = new NotificationService(), private searchService = new SearchService()) {
        let $element = $(element);
        this.initialize($element);
        this.show($element);
    }

    private initialize(element: JQuery) {
        let data = element.data();
        this.apiUrl = data.apiUrl;
        this.treebankService = new TreebankService(this.apiUrl);
        this.searchService.resultsUrl = data.resultsUrl;
        this.corpus = data.corpus;
        this.variables =
            $.makeArray($('#xpath-variables .path-variable'))
                .map((element) => {
                    let data = $(element).data();
                    return <PathVariable>{
                        name: data.name,
                        path: data.path
                    };
                });
    }

    private show(element: JQuery<HTMLElement>) {
        element.addClass('is-loading');
        Promise.all([
            this.treebankService.getMetadata(this.corpus) as any,
            this.searchService.getAllResults(this.variables, true) as any])
            .then((values: any) => {
                let [metadataKeys, searchResults] = values;
                this.pivot(element, metadataKeys, searchResults)
                    .removeClass('is-loading');
            }).catch(error => {
                this.notificationService.messageOnError(`An error occurred: ${error}.`);
            });
    }

    private pivot(element: JQuery, metadataKeys: string[], searchResults: SearchResult[]) {
        let utils = $.pivotUtilities;
        let heatmap = utils.renderers["Heatmap"];
        let renderers = $.extend($.pivotUtilities.renderers,
            { 'File export': (new FileExportRenderer()).render });
        let pivotData = this.analysisService.getFlatTable(searchResults, this.variables.map(x => x.name), metadataKeys);
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