define(["require", "exports", "jquery"], function (require, exports, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var SearchService = (function () {
        function SearchService() {
        }
        SearchService.prototype.getAllResults = function (variables) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                $.ajax('basex-search-scripts/get-all-results.php', {
                    data: { variables: variables },
                    method: 'post'
                }).done(function (json) {
                    var data = $.parseJSON(json);
                    if (!data.error) {
                        if (!data.data) {
                            return resolve([]);
                        }
                        return resolve(_this.parseData(data.data));
                    }
                    else {
                        return reject(data.error);
                    }
                });
            });
        };
        SearchService.prototype.parseData = function (data) {
            var result = [];
            for (var sentenceId in data) {
                var _a = data[sentenceId], link = _a[0], highlightedSentence = _a[1], componentName = _a[2], metadata = _a[3], nodeXml = _a[4], variablesXml = _a[5];
                result.push({
                    sentenceId: sentenceId,
                    viewUrl: $(link).attr('href'),
                    fileName: $(link).text(),
                    highlightedSentence: highlightedSentence,
                    componentName: componentName,
                    metadata: this.parseMetadata(metadata),
                    nodeXml: nodeXml,
                    variables: this.parseVariables(variablesXml)
                });
            }
            ;
            return result;
        };
        SearchService.prototype.parseMetadata = function (xml) {
            var tree = $($.parseXML("<metadata>" + xml + "</metadata>"));
            var result = {};
            tree.find('meta').each(function (index, item) {
                result[$(item).attr('name')] = $(item).attr('value');
            });
            return result;
        };
        SearchService.prototype.parseVariables = function (xml) {
            var vars = $($.parseXML(xml)).find('var');
            var result = {};
            vars.each(function (index, variable) {
                var $variable = $(variable);
                result[$variable.attr('name')] = {
                    pos: $variable.attr('pos'),
                    lemma: $variable.attr('lemma')
                };
            });
            return result;
        };
        return SearchService;
    }());
    exports.SearchService = SearchService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoLXNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90cy9zZXJ2aWNlcy9zZWFyY2gtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztJQUdBO1FBQUE7UUFrRUEsQ0FBQztRQWpFVSxxQ0FBYSxHQUFwQixVQUFxQixTQUF5QjtZQUE5QyxpQkFtQkM7WUFqQkcsTUFBTSxDQUFDLElBQUksT0FBTyxDQUFpQixVQUFDLE9BQU8sRUFBRSxNQUFNO2dCQUMvQyxDQUFDLENBQUMsSUFBSSxDQUFDLDBDQUEwQyxFQUFFO29CQUMvQyxJQUFJLEVBQUUsRUFBRSxTQUFTLFdBQUEsRUFBRTtvQkFDbkIsTUFBTSxFQUFFLE1BQU07aUJBQ2pCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxJQUFJO29CQUNULElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQzdCLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ2QsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs0QkFDYixNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO3dCQUN2QixDQUFDO3dCQUVELE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztvQkFDOUMsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDSixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDOUIsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQztRQUVPLGlDQUFTLEdBQWpCLFVBQWtCLElBQXdDO1lBQ3RELElBQUksTUFBTSxHQUFtQixFQUFFLENBQUM7WUFDaEMsR0FBRyxDQUFDLENBQUMsSUFBSSxVQUFVLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdEIsSUFBQSxxQkFBOEYsRUFBN0YsWUFBSSxFQUFFLDJCQUFtQixFQUFFLHFCQUFhLEVBQUUsZ0JBQVEsRUFBRSxlQUFPLEVBQUUsb0JBQVksQ0FBcUI7Z0JBR25HLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ1IsVUFBVSxZQUFBO29CQUNWLE9BQU8sRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFDN0IsUUFBUSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUU7b0JBQ3hCLG1CQUFtQixxQkFBQTtvQkFDbkIsYUFBYSxlQUFBO29CQUNiLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQztvQkFDdEMsT0FBTyxTQUFBO29CQUNQLFNBQVMsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQztpQkFDL0MsQ0FBQyxDQUFDO1lBQ1AsQ0FBQztZQUFBLENBQUM7WUFFRixNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFFTyxxQ0FBYSxHQUFyQixVQUFzQixHQUFXO1lBQzdCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsYUFBYSxDQUFDLENBQUMsQ0FBQztZQUM3RCxJQUFJLE1BQU0sR0FBYSxFQUFFLENBQUM7WUFFMUIsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxLQUFLLEVBQUUsSUFBSTtnQkFDL0IsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxDQUFDLE1BQU0sQ0FBQztRQUNsQixDQUFDO1FBRU8sc0NBQWMsR0FBdEIsVUFBdUIsR0FBVztZQUM5QixJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxJQUFJLE1BQU0sR0FBYyxFQUFFLENBQUM7WUFFM0IsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUssRUFBRSxRQUFRO2dCQUN0QixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzVCLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUc7b0JBQzdCLEdBQUcsRUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztvQkFDMUIsS0FBSyxFQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO2lCQUNqQyxDQUFDO1lBQ04sQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQ2xCLENBQUM7UUFDTCxvQkFBQztJQUFELENBQUMsQUFsRUQsSUFrRUM7SUFsRVksc0NBQWEifQ==