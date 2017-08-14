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
            var $element = $(element);
            this.initialize($element);
            this.show($element);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHlzaXMtY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMvYW5hbHlzaXMtY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBU0E7UUFNSSwyQkFBWSxPQUFvQixFQUFVLGVBQXVDLEVBQVUsbUJBQStDLEVBQVUsYUFBbUM7WUFBN0ksZ0NBQUEsRUFBQSxzQkFBc0Isa0NBQWUsRUFBRTtZQUFVLG9DQUFBLEVBQUEsMEJBQTBCLDBDQUFtQixFQUFFO1lBQVUsOEJBQUEsRUFBQSxvQkFBb0IsOEJBQWEsRUFBRTtZQUE3SSxvQkFBZSxHQUFmLGVBQWUsQ0FBd0I7WUFBVSx3QkFBbUIsR0FBbkIsbUJBQW1CLENBQTRCO1lBQVUsa0JBQWEsR0FBYixhQUFhLENBQXNCO1lBQ25MLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUMxQixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEIsQ0FBQztRQUVPLHNDQUFVLEdBQWxCLFVBQW1CLE9BQWU7WUFDOUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztZQUMxQixJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksa0NBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDeEQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQzFCLElBQUksQ0FBQyxTQUFTO2dCQUNWLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7cUJBQzVDLEdBQUcsQ0FBQyxVQUFDLE9BQU87b0JBQ1QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO29CQUM3QixNQUFNLENBQWU7d0JBQ2pCLElBQUksRUFBRSxJQUFJLENBQUMsSUFBSTt3QkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7cUJBQ2xCLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLENBQUM7UUFDZixDQUFDO1FBRU8sZ0NBQUksR0FBWixVQUFhLE9BQU87WUFBcEIsaUJBVUM7WUFURyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNSLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQVE7Z0JBQ3BELElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQVE7YUFBQyxDQUFDO2lCQUN4RCxJQUFJLENBQUMsVUFBQyxNQUFXO2dCQUNULElBQUEsd0JBQVksRUFBRSx5QkFBYSxDQUFXO2dCQUMzQyxLQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxZQUFZLEVBQUUsYUFBYSxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUEsS0FBSztnQkFDVixLQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLHdCQUFzQixLQUFLLE1BQUcsQ0FBQyxDQUFDO1lBQzVFLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQztRQUVPLGlDQUFLLEdBQWIsVUFBYyxPQUFlLEVBQUUsWUFBc0IsRUFBRSxhQUE2QjtZQUNoRixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsY0FBYyxDQUFDO1lBQzdCLElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDekMsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxDQUFDLElBQUksRUFBTixDQUFNLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBQztZQUNoSCxPQUFPLENBQUMsT0FBTyxDQUNYLFNBQVMsRUFBRTtnQkFDUCxXQUFXLEVBQUU7b0JBQ1QsT0FBTyxFQUFFLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDO29CQUNuQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLHFCQUFxQixDQUFDO29CQUMvRCw4QkFBOEIsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLDhCQUE4QixDQUFDO29CQUNqRiw0QkFBNEIsRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLDRCQUE0QixDQUFDO29CQUM3RSxPQUFPLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUM7b0JBQ25DLE1BQU0sRUFBRSxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQztpQkFDcEM7Z0JBQ0QsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDO2dCQUNkLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztnQkFDZCxRQUFRLEVBQUUsT0FBTzthQUNwQixDQUFDLENBQUM7UUFDWCxDQUFDO1FBQ0wsd0JBQUM7SUFBRCxDQUFDLEFBM0RELElBMkRDO0lBM0RZLDhDQUFpQiJ9