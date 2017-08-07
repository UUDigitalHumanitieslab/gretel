define(["require", "exports", "./analysis-component", "./xpath-variables-component"], function (require, exports, analysis_component_1, xpath_variables_component_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var ComponentsRenderer = (function () {
        function ComponentsRenderer() {
            this.componentMap = {
                'analysis': analysis_component_1.AnalysisComponent,
                'xpath-variables': xpath_variables_component_1.XPathVariablesComponent
            };
        }
        ComponentsRenderer.prototype.render = function () {
            var _this = this;
            var _loop_1 = function (selector) {
                $(selector).each(function (index, element) { return new (_this.componentMap[selector])($(element)); });
            };
            for (var selector in this.componentMap) {
                _loop_1(selector);
            }
        };
        return ComponentsRenderer;
    }());
    exports.ComponentsRenderer = ComponentsRenderer;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50cy1yZW5kZXJlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL2NvbXBvbmVudHMtcmVuZGVyZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFHQTtRQUFBO1lBQ1ksaUJBQVksR0FBRztnQkFDbkIsVUFBVSxFQUFFLHNDQUFpQjtnQkFDN0IsaUJBQWlCLEVBQUUsbURBQXVCO2FBQzdDLENBQUE7UUFPTCxDQUFDO1FBTFUsbUNBQU0sR0FBYjtZQUFBLGlCQUlDO29DQUhZLFFBQVE7Z0JBQ2IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFDLEtBQUssRUFBRSxPQUFPLElBQUssT0FBQSxJQUFJLENBQUMsS0FBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUE3QyxDQUE2QyxDQUFDLENBQUM7WUFDeEYsQ0FBQztZQUZELEdBQUcsQ0FBQyxDQUFDLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUM7d0JBQTlCLFFBQVE7YUFFaEI7UUFDTCxDQUFDO1FBQ0wseUJBQUM7SUFBRCxDQUFDLEFBWEQsSUFXQztJQVhZLGdEQUFrQiJ9