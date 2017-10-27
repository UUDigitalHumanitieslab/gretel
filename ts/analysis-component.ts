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
        Promise.all([
            this.treebankService.getMetadata(this.corpus) as any,
            this.searchService.getAllResults(this.variables) as any])
            .then((values: any) => {
                let [metadataKeys, searchResults] = values;
                this.pivot(element, metadataKeys, searchResults);
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
        element.pivotUI(
            pivotData, {
                aggregators: {
                    'Count': utils.aggregators['Count'],
                    'Count Unique Values': utils.aggregators['Count Unique Values'],
                    'Count as Fraction of Columns': utils.aggregators['Count as Fraction of Columns'],
                    'Count as Fraction of Total': utils.aggregators['Count as Fraction of Total'],
                    'First': utils.aggregators['First'],
                    'Last': utils.aggregators['Last']
                },
                rows: ['lem1'],
                cols: ['pos1'],
                renderer: heatmap,
                renderers
            });
    }
}