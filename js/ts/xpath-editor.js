define(["require", "exports", "rxjs", "ace/ace", "ace/range", "./services/xpath-parser.service"], function (require, exports, rxjs_1, ace, range_1, xpath_parser_service_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Selector = 'xpath-editor';
    var XPathEditor = (function () {
        function XPathEditor(element) {
            var _this = this;
            this.existingMarkerId = undefined;
            this.valueSubject = new rxjs_1.BehaviorSubject('');
            this.parsedObservable = this.valueSubject.debounceTime(50).map(function (xpath) { return _this.xpathParserService.parse(xpath); });
            this.$element = $(element);
            this.$element.data('xpath-editor', this);
            this.$hiddenInput = this.$element.children('textarea');
            this.$hiddenInput.addClass('hidden');
            this.autofocus = !!this.$element.attr('autofocus');
            this.value = this.$hiddenInput.val();
            this.xpathParserService = new xpath_parser_service_1.default();
            this.initialize(this.$element);
        }
        XPathEditor.prototype.updateValue = function () {
            this.value = this.session.getValue();
            this.$hiddenInput.val(this.value);
            this.$hiddenInput.trigger('change');
            this.valueSubject.next(this.value);
        };
        XPathEditor.prototype.initialize = function (element) {
            var _this = this;
            element.css({
                display: 'block',
                width: '100%'
            });
            var $container = $('<div>');
            this.$errorElement = $('<p class="errorMessage"></p>');
            (_a = this.$element).append.apply(_a, [$container, this.$errorElement]);
            var editor = ace.edit($container[0]);
            editor.setValue(this.value, -1);
            if (this.autofocus) {
                editor.focus();
            }
            editor.setTheme('ace/theme/dawn');
            editor.setOptions({
                'highlightActiveLine': false,
                'showGutter': false,
                'showPrintMargin': false,
                'fontSize': 16,
                'minLines': 2,
                'maxLines': 30,
                'useWorker': false
            });
            this.session = editor.getSession();
            this.session.setMode('ace/mode/xquery');
            editor.on('change', function () { return _this.updateValue(); });
            this.showErrors();
            var _a;
        };
        XPathEditor.prototype.showErrors = function () {
            var _this = this;
            this.parsedObservable
                .subscribe(function (parsed) {
                if (_this.existingMarkerId != undefined) {
                    _this.session.removeMarker(_this.existingMarkerId);
                }
                if (parsed.error) {
                    var pathRange = void 0;
                    if (parsed.error.offset == undefined) {
                        pathRange = new range_1.Range(parsed.error.line, 0, parsed.error.line + 1, 0);
                    }
                    else {
                        pathRange = new range_1.Range(parsed.error.line, parsed.error.offset, parsed.error.line, parsed.error.offset + parsed.error.length);
                    }
                    _this.existingMarkerId = _this.session.addMarker(pathRange, 'pathError', 'text', undefined);
                    _this.$errorElement.text(parsed.error.message);
                }
                else {
                    _this.$errorElement.text('');
                }
            });
        };
        return XPathEditor;
    }());
    exports.XPathEditor = XPathEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMveHBhdGgtZWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBTWEsUUFBQSxRQUFRLEdBQUcsY0FBYyxDQUFDO0lBQ3ZDO1FBZUkscUJBQVksT0FBb0I7WUFBaEMsaUJBWUM7WUFoQk8scUJBQWdCLEdBQXVCLFNBQVMsQ0FBQztZQUNqRCxpQkFBWSxHQUE0QixJQUFJLHNCQUFlLENBQVMsRUFBRSxDQUFDLENBQUM7WUFDeEUscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQyxDQUFDO1lBRzdHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQVksQ0FBQztZQUUvQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSw4QkFBa0IsRUFBRSxDQUFDO1lBRW5ELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25D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