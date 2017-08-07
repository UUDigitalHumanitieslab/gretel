import { NotificationService } from './services/notification-service';
import { TreebankService } from './services/treebank-service';
import { SearchService, SearchResult } from './services/search-service';
import { PathVariable } from './xpath-extractinator';
import * as $ from 'jquery';
import 'pivottable/pivot';

export class AnalysisComponent {
    variables: PathVariable[];
    apiUrl: string;
    corpus: string;
    treebankService: TreebankService;

    constructor(element: JQuery, private notificationService = new NotificationService(), private searchService = new SearchService()) {
        this.initialize(element);
        this.show(element);
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

    private show(element) {
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
        var utils = $.pivotUtilities;
        var heatmap = utils.renderers["Heatmap"];

        let fields: string[] = [];

        // for each match: the metadata, the POS-tags and lemmata
        var m_list = [];
        var pos_list = [];
        var lemmata_list = [];
        var pos_by_var_list = [];
        var lemmata_by_var_list = [];

        // iterate through the found matches
        for (let result of searchResults) {
            var mv = [];
            $.each(metadataKeys, function (j, v) {
                mv.push(result.metadata[v]);
            });
            m_list.push(mv);

            var nodes = $($.parseXML(result.nodeXml));
            var lemmata = [];
            var pos = [];
            $.each(nodes.find('node'), function (j, v) {
                var attr = $(v).attr('pos');
                if (attr) {
                    pos.push(attr);
                }

                var attr = $(v).attr('lemma');
                if (attr) {
                    lemmata.push(attr);
                }
            });


            var vars = result.variables;
            var pos_by_var = [], lemmata_by_var = [];
            for (let variable of this.variables.map(x => result.variables[x.name])) {
                pos_by_var.push(variable.pos);
                lemmata_by_var.push(variable.lemma);
            };

            pos_list.push(pos);
            lemmata_list.push(lemmata);
            pos_by_var_list.push(pos_by_var);
            lemmata_by_var_list.push(lemmata_by_var);
        };

        // TODO: this could be done more efficient, either just max (O(n)) instead of sort
        // or integrate this in the existing loop above.
        var longest = pos_list.sort(function (a, b) {
            return b.length - a.length;
        })[0].length;

        for (var i = 1; i <= longest; i++) {
            fields.push('pos' + i);
        }
        for (var i = 1; i <= longest; i++) {
            fields.push('lem' + i);
        }

        for (let variable of this.variables) {
            var name = variable.name.replace('$', '');
            fields.push(`pos_${name}`);
        }

        for (let variable of this.variables) {
            var name = variable.name.replace('$', '');
            fields.push(`lem_${name}`);
        }

        var pivotData = [fields];

        $.each(m_list, function (i, m) {
            var line = [];

            line.push.apply(line, m_list[i]);
            // TODO: instead of first expanding the pos_list and then appending
            // that list to the result list. Directly expand the result list.
            var p = pos_list[i];
            while (p.length < longest) {
                p.push('(none)');
            }
            line.push.apply(line, pos_list[i]);
            var l = lemmata_list[i];
            while (l.length < longest) {
                l.push('(none)');
            }
            line.push.apply(line, lemmata_list[i]);
            line.push.apply(line, pos_by_var_list[i]);
            line.push.apply(line, lemmata_by_var_list[i]);

            pivotData.push(line);
        });


        element.pivotUI(
            pivotData, {
                rows: [],
                cols: [],
                renderer: heatmap
            });
    }
}