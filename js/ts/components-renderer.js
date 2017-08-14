define(["require", "exports", "./analysis-component", "./xpath-editor", "./xpath-variables-component", "jquery"], function (require, exports, analysis_component_1, xpath_editor_1, xpath_variables_component_1, $) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComponentsRenderer = (function () {
        function ComponentsRenderer() {
            this.componentMap = {
                'analysis': analysis_component_1.AnalysisComponent,
                'xpath-editor': xpath_editor_1.XPathEditor,
                'xpath-variables': xpath_variables_component_1.XPathVariablesComponent
            };
        }
        ComponentsRenderer.prototype.render = function () {
            var _this = this;
            var _loop_1 = function (selector) {
                $(selector).each(function (index, element) { return new (_this.componentMap[selector])(element); });
            };
            for (var selector in this.componentMap) {
                _loop_1(selector);
            }
        };
        return ComponentsRenderer;
    }());
    exports.ComponentsRenderer = ComponentsRenderer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50cy1yZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL2NvbXBvbmVudHMtcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFNQTtRQUFBO1lBQ1ksaUJBQVksR0FBRztnQkFDbkIsVUFBVSxFQUFFLHNDQUFpQjtnQkFDN0IsY0FBYyxFQUFFLDBCQUFXO2dCQUMzQixpQkFBaUIsRUFBRSxtREFBdUI7YUFDN0MsQ0FBQTtRQU9MLENBQUM7UUFMVSxtQ0FBTSxHQUFiO1lBQUEsaUJBSUM7b0NBSFksUUFBUTtnQkFDYixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsS0FBSyxFQUFFLE9BQU8sSUFBSyxPQUFBLElBQUksQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQTFDLENBQTBDLENBQUMsQ0FBQztZQUNyRixDQUFDO1lBRkQsR0FBRyxDQUFDLENBQUMsSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQzt3QkFBOUIsUUFBUTthQUVoQjtRQUNMLENBQUM7UUFDTCx5QkFBQztJQUFELENBQUMsQUFaRCxJQVlDO0lBWlksZ0RBQWtCIn0=