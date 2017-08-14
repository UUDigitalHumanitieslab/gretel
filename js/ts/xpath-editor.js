define(["require", "exports", "ace/ace"], function (require, exports, ace) {
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Selector = 'xpath-editor';
    var XPathEditor = (function () {
        function XPathEditor(element) {
            this.$element = $(element);
            this.$element.data('xpath-editor', this);
            this.$hiddenInput = this.$element.children('textarea');
            this.$hiddenInput.addClass('hidden');
            this.autofocus = !!this.$element.attr('autofocus');
            this.value = this.$hiddenInput.val();
            this.initialize(this.$element);
        }
        XPathEditor.prototype.updateValue = function () {
            this.value = this.session.getValue();
            this.$hiddenInput.val(this.value);
            this.$hiddenInput.trigger('change');
        };
        XPathEditor.prototype.initialize = function (element) {
            var _this = this;
            element.css({
                display: 'block',
                width: '100%'
            });
            var $container = $('<div>');
            this.$element.append($container);
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
            this.session = editor.getSession();
            this.session.setMode('ace/mode/xquery');
            editor.on('change', function () { return _this.updateValue(); });
        };
        return XPathEditor;
    }());
    exports.XPathEditor = XPathEditor;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieHBhdGgtZWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vdHMveHBhdGgtZWRpdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0lBRWEsUUFBQSxRQUFRLEdBQUcsY0FBYyxDQUFDO0lBQ3ZDO1FBU0kscUJBQVksT0FBb0I7WUFDNUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7WUFFckMsSUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbkQsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBWSxDQUFDO1lBRS9DLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25DLENBQUM7UUFFTyxpQ0FBVyxHQUFuQjtZQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNyQyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEMsQ0FBQztRQUVPLGdDQUFVLEdBQWxCLFVBQW1CLE9BQWU7WUFBbEMsaUJBeUJDO1lBeEJHLE9BQU8sQ0FBQyxHQUFHLENBQUM7Z0JBQ1IsT0FBTyxFQUFFLE9BQU87Z0JBQ2hCLEtBQUssRUFBRSxNQUFNO2FBQ2hCLENBQUMsQ0FBQztZQUNILElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNqQyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDbkIsQ0FBQztZQUNELE1BQU0sQ0FBQyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUVsQyxNQUFNLENBQUMsU0FBUyxDQUFDLHFCQUFxQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFDakMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDaEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7WUFFakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztZQUV4QyxNQUFNLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxjQUFNLE9BQUEsS0FBSSxDQUFDLFdBQVcsRUFBRSxFQUFsQixDQUFrQixDQUFDLENBQUM7UUFDbEQsQ0FBQztRQUNMLGtCQUFDO0lBQUQsQ0FBQyxBQXJERCxJQXFEQztJQXJEWSxrQ0FBVyJ9