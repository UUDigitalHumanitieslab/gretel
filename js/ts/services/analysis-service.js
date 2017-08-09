define(["require", "exports", "jquery"], function (require, exports, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var AnalysisService = (function () {
        function AnalysisService() {
        }
        AnalysisService.prototype.getRow = function (variables, metadataKeys, result, placeholder) {
            var nodes = $($.parseXML(result.nodeXml)).find('node[lemma]');
            var metadataValues = {};
            for (var _i = 0, metadataKeys_1 = metadataKeys; _i < metadataKeys_1.length; _i++) {
                var key = metadataKeys_1[_i];
                metadataValues[key] = result.metadata[key];
            }
            var nodeProperties = {};
            nodes.each(function (index, node) {
                var $node = $(node);
                var pos = $node.attr('pos');
                var lemma = $node.attr('lemma');
                nodeProperties[index + 1] = {
                    pos: pos ? pos : placeholder,
                    lemma: lemma ? lemma : placeholder
                };
            });
            var nodeVariableValues = {};
            for (var _a = 0, variables_1 = variables; _a < variables_1.length; _a++) {
                var variable = variables_1[_a];
                var value = result.variables[variable];
                nodeVariableValues[variable] = {
                    pos: value && value.pos ? value.pos : placeholder,
                    lemma: value && value.lemma ? value.lemma : placeholder
                };
            }
            return { metadataValues: metadataValues, nodeCount: nodes.length, nodeProperties: nodeProperties, nodeVariableValues: nodeVariableValues };
        };
        AnalysisService.prototype.getFlatTable = function (searchResults, variables, metadataKeys, placeholder) {
            if (placeholder === void 0) { placeholder = '(none)'; }
            var rows = [];
            var maxNodeCount = 0;
            for (var _i = 0, searchResults_1 = searchResults; _i < searchResults_1.length; _i++) {
                var result = searchResults_1[_i];
                var row = this.getRow(variables, metadataKeys, result, placeholder);
                rows.push(row);
                if (row.nodeCount > maxNodeCount) {
                    maxNodeCount = row.nodeCount;
                }
            }
            var columnNames = [];
            columnNames.push.apply(columnNames, metadataKeys);
            var nodePositions = Array.apply(null, { length: maxNodeCount }).map(function (_, index) { return index + 1; });
            columnNames.push.apply(columnNames, nodePositions.map(function (i) { return "pos" + i; }));
            columnNames.push.apply(columnNames, nodePositions.map(function (i) { return "lem" + i; }));
            columnNames.push.apply(columnNames, variables.map(function (name) { return "pos_" + name.slice(1); }));
            columnNames.push.apply(columnNames, variables.map(function (name) { return "lem_" + name.slice(1); }));
            var results = [columnNames];
            var _loop_1 = function (row) {
                var line = [];
                line.push.apply(line, metadataKeys.map(function (key) { return row.metadataValues[key] ? row.metadataValues[key] : placeholder; }));
                line.push.apply(line, nodePositions.map(function (i) { return row.nodeProperties[i] ? row.nodeProperties[i].pos : placeholder; }));
                line.push.apply(line, nodePositions.map(function (i) { return row.nodeProperties[i] ? row.nodeProperties[i].lemma : placeholder; }));
                line.push.apply(line, variables.map(function (name) { return row.nodeVariableValues[name] ? row.nodeVariableValues[name].pos : placeholder; }));
                line.push.apply(line, variables.map(function (name) { return row.nodeVariableValues[name] ? row.nodeVariableValues[name].lemma : placeholder; }));
                results.push(line);
            };
            for (var _a = 0, rows_1 = rows; _a < rows_1.length; _a++) {
                var row = rows_1[_a];
                _loop_1(row);
            }
            ;
            return results;
        };
        return AnalysisService;
    }());
    exports.AnalysisService = AnalysisService;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5hbHlzaXMtc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3RzL3NlcnZpY2VzL2FuYWx5c2lzLXNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFpQkE7UUFBQTtRQWtGQSxDQUFDO1FBakZXLGdDQUFNLEdBQWQsVUFBZSxTQUFtQixFQUFFLFlBQXNCLEVBQUUsTUFBb0IsRUFBRSxXQUFtQjtZQUNqRyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDOUQsSUFBSSxjQUFjLEdBQStCLEVBQUUsQ0FBQztZQUNwRCxHQUFHLENBQUMsQ0FBWSxVQUFZLEVBQVosNkJBQVksRUFBWiwwQkFBWSxFQUFaLElBQVk7Z0JBQXZCLElBQUksR0FBRyxxQkFBQTtnQkFDUixjQUFjLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUM5QztZQUVELElBQUksY0FBYyxHQUEyQyxFQUFFLENBQUM7WUFDaEUsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUssRUFBRSxJQUFJO2dCQUNuQixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3BCLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQzVCLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ2hDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUc7b0JBQ3hCLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLFdBQVc7b0JBQzVCLEtBQUssRUFBRSxLQUFLLEdBQUcsS0FBSyxHQUFHLFdBQVc7aUJBQ3JDLENBQUM7WUFDTixDQUFDLENB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