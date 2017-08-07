define(["require", "exports", "./services/notification-service", "./services/treebank-service", "./services/search-service"], function (require, exports, notification_service_1, treebank_service_1, search_service_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AnalysisComponent = (function () {
        function AnalysisComponent(element, notificationService, searchService) {
            if (notificationService === void 0) { notificationService = new notification_service_1.NotificationService(); }
            if (searchService === void 0) { searchService = new search_service_1.SearchService(); }
            this.notificationService = notificationService;
            this.searchService = searchService;
            this.initialize(element);
            this.show(element);
        }
        AnalysisComponent.prototype.initialize = function (element) {
            var data = element.data();
            this.apiUrl = data.apiUrl;
            this.treebankService = new treebank_service_1.TreebankService(this.apiUrl);
            this.corpus = data.corpus;
            this.variables =
                $.makeArray($('#xpath-variables .path-variable'))
                    .map(function (element) {
                    var data = $(element).data();
                    return {
                        name: data.name,
                        path: data.path
                    };
                });
        };
        AnalysisComponent.prototype.show = function (element) {
            var _this = this;
            Promise.all([
                this.treebankService.getMetadata(this.corpus),
                this.searchService.getAllResults(this.variables)
            ])
                .then(function (values) {
                var metadataKeys = values[0], searchResults = values[1];
                _this.pivot(element, metadataKeys, searchResults);
            }).catch(function (error) {
                _this.notificationService.messageOnError("An error occurred: " + error + ".");
            });
        };
        AnalysisComponent.prototype.pivot = function (element, metadataKeys, searchResults) {
            var utils = $.pivotUtilities;
            var heatmap = utils.renderers["Heatmap"];
            var fields = [];
            var m_list = [];
            var pos_list = [];
            var lemmata_list = [];
            var pos_by_var_list = [];
            var lemmata_by_var_list = [];
            var _loop_1 = function (result) {
                mv = [];
                $.each(metadataKeys, function (j, v) {
                    mv.push(result.metadata[v]);
                });
                m_list.push(mv);
                nodes = $($.parseXML(result.nodeXml));
                lemmata = [];
                pos = [];
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
                vars = result.variables;
                pos_by_var = [], lemmata_by_var = [];
                for (var _i = 0, _a = this_1.variables.map(function (x) { return result.variables[x.name]; }); _i < _a.length; _i++) {
                    var variable = _a[_i];
                    pos_by_var.push(variable.pos);
                    lemmata_by_var.push(variable.lemma);
                }
                ;
                pos_list.push(pos);
                lemmata_list.push(lemmata);
                pos_by_var_list.push(pos_by_var);
                lemmata_by_var_list.push(lemmata_by_var);
            };
            var this_1 = this, mv, nodes, lemmata, pos, vars, pos_by_var, lemmata_by_var;
            for (var _i = 0, searchResults_1 = searchResults; _i < searchResults_1.length; _i++) {
                var result = searchResults_1[_i];
                _loop_1(result);
            }
            ;
            var longest = pos_list.sort(function (a, b) {
                return b.length - a.length;
            })[0].length;
            for (var i = 1; i <= longest; i++) {
                fields.push('pos' + i);
            }
            for (var i = 1; i <= longest; i++) {
                fields.push('lem' + i);
            }
            for (var _a = 0, _b = this.variables; _a < _b.length; _a++) {
                var variable = _b[_a];
                var name = variable.name.replace('$', '');
                fields.push("pos_" + name);
            }
            for (var _c = 0, _d = this.variables; _c < _d.length; _c++) {
                var variable = _d[_c];
                var name = variable.name.replace('$', '');
                fields.push("lem_" + name);
            }
            var pivotData = [fields];
            $.each(m_list, function (i, m) {
                var line = [];
                line.push.apply(line, m_list[i]);
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
            element.pivotUI(pivotData, {
                rows: [],
                cols: [],
                renderer: heatmap
            });
        };
        return AnalysisComponent;
    }());
    exports.AnalysisComponent = AnalysisComponent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHlzaXMtY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvYW5hbHlzaXMtY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBUUE7UUFNSSwyQkFBWSxPQUFlLEVBQVUsbUJBQStDLEVBQVUsYUFBbUM7WUFBNUYsb0NBQUEsRUFBQSwwQkFBMEIsMENBQW1CLEVBQUU7WUFBVSw4QkFBQSxFQUFBLG9CQUFvQiw4QkFBYSxFQUFFO1lBQTVGLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBNEI7WUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7WUFDN0gsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFFTyxzQ0FBVSxHQUFsQixVQUFtQixPQUFlO1lBQzlCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGtDQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUztnQkFDVixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO3FCQUM1QyxHQUFHLENBQUMsVUFBQyxPQUFPO29CQUNULElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDN0IsTUFBTSxDQUFlO3dCQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7d0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO3FCQUNsQixDQUFDO2dCQUNOLENBQUMsQ0FBQyxD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