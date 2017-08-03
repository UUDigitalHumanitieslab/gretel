define(["require", "exports", "./xpath-extractinator", "rxjs", "./parser/xpath-models"], function (require, exports, xpath_extractinator_1, rxjs_1, xpath_models_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var XPathVariablesComponent = (function () {
        function XPathVariablesComponent(element) {
            var _this = this;
            this.subject = new rxjs_1.BehaviorSubject('');
            this.variables = this.subject.debounceTime(50).map(function (xpath) { return _this.extract(xpath); }).filter(function (variables) { return variables != null; });
            var data = $(element).data();
            this.source = $(data.source);
            this.view = new View(data.name, element);
            this.variables.subscribe(function (variables) {
                _this.view.render(variables);
            });
            this.update();
            this.source.on('change keyup', function (evt) { return _this.update(); });
            this.extractinator = new xpath_extractinator_1.XPathExtractinator();
        }
        XPathVariablesComponent.prototype.update = function () {
            this.subject.next(this.source.val());
        };
        XPathVariablesComponent.prototype.extract = function (xpath) {
            try {
                return this.extractinator.extract(xpath);
            }
            catch (error) {
                if (!(error instanceof xpath_models_1.XPathModels.ParseError || error instanceof xpath_extractinator_1.FormatError)) {
                    throw error;
                }
            }
            return null;
        };
        return XPathVariablesComponent;
    }());
    exports.XPathVariablesComponent = XPathVariablesComponent;
    var View = (function () {
        function View(formName, target) {
            var _this = this;
            this.formName = formName;
            this.target = target;
            this.renderedLength = 0;
            this.names = [];
            this.paths = [];
            this.renderItem = function (index) {
                var nameInput = $("<input type=\"hidden\" name=\"" + _this.formName + "[" + index + "].name\" />");
                var pathInput = $("<input type=\"hidden\" name=\"" + _this.formName + "[" + index + "].path\" />");
                _this.target.append(nameInput);
                _this.target.append(pathInput);
                _this.names.push(nameInput);
                _this.paths.push(pathInput);
            };
        }
        View.prototype.render = function (items) {
            if (this.renderedLength != items.length) {
                this.target.empty();
                this.names = [];
                this.paths = [];
                for (var i = 0; i < items.length; i++) {
                    this.renderItem(i);
                }
            }
            for (var i = 0; i < items.length; i++) {
                this.names[i].val(items[i].name);
                this.paths[i].val(items[i].path);
            }
        };
        return View;
    }());
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtdmFyaWFibGVzLWNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3RzL3hwYXRoLXZhcmlhYmxlcy1jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7SUFJQTtRQVFJLGlDQUFZLE9BQWU7WUFBM0IsaUJBZUM7WUFsQk8sWUFBTyxHQUE0QixJQUFJLHNCQUFlLENBQVMsRUFBRSxDQUFDLENBQUM7WUFDbkUsY0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUssSUFBSSxPQUFBLEtBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQW5CLENBQW1CLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQSxTQUFTLElBQUksT0FBQSxTQUFTLElBQUksSUFBSSxFQUFqQixDQUFpQixDQUFDLENBQUM7WUFHdkgsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUU3QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFekMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsVUFBQSxTQUFTO2dCQUM5QixLQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztZQUdILElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFBLEdBQUcsSUFBSSxPQUFBLEtBQUksQ0FBQyxNQUFNLEVBQUUsRUFBYixDQUFhLENBQUMsQ0FBQztZQUVyRCxJQUFJLENB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