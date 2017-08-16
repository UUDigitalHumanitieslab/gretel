define(["require", "exports", "rxjs", "ace/ace", "./services/xpath-parser.service"], function (require, exports, rxjs_1, ace, xpath_parser_service_1) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Selector = 'xpath-editor';
    var XPathEditor = (function () {
        function XPathEditor(element) {
            var _this = this;
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
            editor.setOption('highlightActiveLine', false);
            editor.setOption('showGutter', false);
            editor.setOption('showPrintMargin', false);
            editor.setOption('fontSize', 16);
            editor.setOption('minLines', 2);
            editor.setOption('maxLines', 30);
            editor.setOption('useWorker', false);
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
                $('.pathError').removeClass('pathError');
                if (parsed.error) {
                    var $line = $(".ace_text-layer .ace_line:nth(" + parsed.error.line + ")");
                    var rangeKnown_1 = parsed.error.offset != undefined && parsed.error.length != undefined;
                    var position_1 = 0;
                    var $children = $line.children();
                    if (!$children.length) {
                        $line.addClass('pathError');
                    }
                    else {
                        $children.each(function (index, child) {
                            var length = child.innerText.length;
                            if (!rangeKnown_1 || (parsed.error.offset >= position_1 && parsed.error.length <= position_1 + length)) {
                                $(child).addClass('pathError');
                            }
                            position_1 += length;
                        });
                    }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMveHBhdGgtZWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBS2EsUUFBQSxRQUFRLEdBQUcsY0FBYyxDQUFDO0lBQ3ZDO1FBY0kscUJBQVksT0FBb0I7WUFBaEMsaUJBWUM7WUFmTyxpQkFBWSxHQUE0QixJQUFJLHNCQUFlLENBQVMsRUFBRSxDQUFDLENBQUM7WUFDeEUscUJBQWdCLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUEsS0FBSyxJQUFJLE9BQUEsS0FBSSxDQUFDLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBcEMsQ0FBb0MsQ0FBQyxDQUFDO1lBRzdHLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ25ELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQVksQ0FBQztZQUUvQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSw4QkFBa0IsRUFBRSxDQUFDO1lBRW5ELElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTyxpQ0FBVyxHQUFuQjtZQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDcEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3ZDLENBQUM7UUFFTyxnQ0FBVSxHQUFsQixVQUFtQixPQUFlO1lBQWxDLGlCQTRCQztZQTNCRyxPQUFPLENBQUMsR0FBRyxDQUFDO2dCQUNSLE9BQU8sRUFBRSxPQUFPO2dCQUNoQixLQUFLLEVBQUUsTUFBTTthQUNoQixDQUFDLENBQUM7WUFDSCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUN2RCxDQUFBLEtBQUEsSUFBSSxDQUFDLFFBQVEsQ0FBQSxDQUFDLE1BQU0sV0FBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDMUQsSUFBSSxNQUFNLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNoQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztnQkFDakIsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ25CLENBQUM7WUFDRCxNQUFNLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFFbEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0QyxNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzNDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBRXJDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFFeEMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBTSxPQUFBLEtBQUksQ0FBQyxXQUFXLEVBQUUsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1lBQzlDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQzs7UUFDdEIsQ0FBQztRQUVPLGdDQUFVLEdBQWxCO1lBQUEsaUJBMEJDO1lBekJHLElBQUksQ0FBQyxnQkFBZ0I7aUJBQ2hCLFNBQVMsQ0FBQyxVQUFBLE1BQU07Z0JBQ2IsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDekMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLG1DQUFpQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksTUFBRyxDQUFDLENBQUM7b0JBQ3JFLElBQUksWUFBVSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLFNBQVMsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSxTQUFTLENBQUM7b0JBQ3RGLElBQUksVUFBUSxHQUFHLENBQUMsQ0FBQztvQkFDakIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNqQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO3dCQUVwQixLQUFLLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO29CQUNoQyxDQUFDO29CQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNKLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBQyxLQUFLLEVBQUUsS0FBSzs0QkFDeEIsSUFBSSxNQUFNLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7NEJBQ3BDLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLElBQUksVUFBUSxJQUFJLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxJQUFJLFVBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0NBQy9GLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUM7NEJBQ25DLENBQUM7NEJBQ0QsVUFBUSxJQUFJLE1BQU0sQ0FBQzt3QkFDdkIsQ0FBQyxDQUFDLENBQUM7b0JBQ1AsQ0FBQztvQkFDRCxLQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNsRCxDQUFDO2dCQUFDLElBQUksQ0FBQyxDQUFDO29CQUNKLEtBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDO1FBQ0wsa0JBQUM7SUFBRCxDQUFDLEFBNUZELElBNEZDO0lBNUZZLGtDQUFXIn0=