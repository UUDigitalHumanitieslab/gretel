define(["require", "exports", "./services/analysis-service", "./services/notification-service", "./services/treebank-service", "./services/search-service", "jquery", "pivottable/pivot"], function (require, exports, analysis_service_1, notification_service_1, treebank_service_1, search_service_1, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AnalysisComponent = (function () {
        function AnalysisComponent(element, analysisService, notificationService, searchService) {
            if (analysisService === void 0) { analysisService = new analysis_service_1.AnalysisService(); }
            if (notificationService === void 0) { notificationService = new notification_service_1.NotificationService(); }
            if (searchService === void 0) { searchService = new search_service_1.SearchService(); }
            this.analysisService = analysisService;
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
            var pivotData = this.analysisService.getFlatTable(searchResults, this.variables.map(function (x) { return x.name; }), metadataKeys);
            element.pivotUI(pivotData, {
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
                renderer: heatmap
            });
        };
        return AnalysisComponent;
    }());
    exports.AnalysisComponent = AnalysisComponent;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHlzaXMtY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvYW5hbHlzaXMtY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBU0E7UUFNSSwyQkFBWSxPQUFlLEVBQVUsZUFBdUMsRUFBVSxtQkFBK0MsRUFBVSxhQUFtQztZQUE3SSxnQ0FBQSxFQUFBLHNCQUFzQixrQ0FBZSxFQUFFO1lBQVUsb0NBQUEsRUFBQSwwQkFBMEIsMENBQW1CLEVBQUU7WUFBVSw4QkFBQSxFQUFBLG9CQUFvQiw4QkFBYSxFQUFFO1lBQTdJLG9CQUFlLEdBQWYsZUFBZSxDQUF3QjtZQUFVLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBNEI7WUFBVSxrQkFBYSxHQUFiLGFBQWEsQ0FBc0I7WUFDOUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZCLENBQUM7UUFFTyxzQ0FBVSxHQUFsQixVQUFtQixPQUFlO1lBQzlCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDMUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGtDQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFJLENBQUMsU0FBUztnQkFDVixDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO3FCQUM1QyxHQUFHLENBQUMsVUFBQyxPQUFPO29CQUNULElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDN0IsTUFBTSxDQUFlO3dCQUNqQixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7d0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO3FCQUNsQixDQUFDO2dCQUNOLENBQUMsQ0FBQyxDQUFDO1FBQ2YsQ0FBQztRQUVPLGdDQUFJLEdBQVosVUFBYSxPQUFPO1lBQXBCLGlCQVVDO1lBVEcsT0FBTyxDQUFDLEdBQUcsQ0FBQztnQkFDUixJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFRO2dCQUNwRCxJQUFJLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFRO2FBQUMsQ0FBQztpQkFDeEQsSUFBSSxDQUFDLFVBQUMsTUFBVztnQkFDVCxJQUFBLHdCQUFZLEVBQUUseUJBQWEsQ0FBVztnQkFDM0MsS0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBQ3JELENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFBLEtBQUs7Z0JBQ1YsS0FBSSxDQUFDLG1CQUFtQixDQUFDLGNBQWMsQ0FBQyx3QkFBc0IsS0FBSyxNQUFHLENBQUMsQ0FBQztZQUM1RSxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFFTyxpQ0FBSyxHQUFiLFVBQWMsT0FBZSxFQUFFLFlBQXNCLEVBQUUsYUFBNkI7WUFDaEYsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQztZQUM3QixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3pDLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUMsSUFBSSxPQUFBLENBQUMsQ0FBQyxJQUFJLEVBQU4sQ0FBTSxDQUFDLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDaEgsT0FBTyxDQUFDLE9BQU8sQ0FDWCxTQUFTLEVBQUU7Z0JBQ1AsV0FBVyxFQUFFO29CQUNULE9BQU8sRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztvQkFDbkMscUJBQXFCLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsQ0FBQztvQkFDL0QsOEJBQThCLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyw4QkFBOEIsQ0FBQztvQkFDakYsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyw0QkFBNEIsQ0FBQztvQkFDN0UsT0FBTyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO29CQUNuQyxNQUFNLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUM7aUJBQ3BDO2dCQUNELElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDZCxJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUM7Z0JBQ2QsUUFBUSxFQUFFLE9BQU87YUFDcEIsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUNMLHdCQUFDO0lBQUQsQ0FBQyxBQTFERCxJQTBEQztJQTFEWSw4Q0FBaUIifQ==