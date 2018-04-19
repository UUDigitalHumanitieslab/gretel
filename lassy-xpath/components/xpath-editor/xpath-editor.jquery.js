"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var $ = require("jquery");
var xpath_editor_1 = require("./xpath-editor");
var _jquery_1 = require("../../services/_jquery");
var JQueryXPathEditor = /** @class */ (function (_super) {
    __extends(JQueryXPathEditor, _super);
    function JQueryXPathEditor(textarea, macrosUrl) {
        var _this = this;
        var macroService = new _jquery_1.MacroService();
        macroService.loadFromUrl(macrosUrl);
        _this = _super.call(this, new _jquery_1.LassyXPathParser(), macroService) || this;
        _this.render(textarea);
        return _this;
    }
    JQueryXPathEditor.prototype.render = function (textArea) {
        var _this = this;
        var $textArea = $(textArea);
        this.$wrapper = $textArea.wrap('<div class="xpath-editor-wrapper" />').parent();
        this.$wrapper.css({
            display: 'block',
            width: '100%'
        });
        var $editorContainer = $('<div>');
        this.$errorElement = $('<p class="errorMessage"></p>');
        (_a = this.$wrapper).append.apply(_a, [$editorContainer, this.$errorElement]);
        // the actual textarea will be hidden
        $textArea.hide();
        var autofocus = !!$textArea.attr('autofocus');
        var value = $textArea.val();
        $textArea.on('remove', function () {
            for (var _i = 0, _a = _this.subscriptions; _i < _a.length; _i++) {
                var subscription = _a[_i];
                subscription.unsubscribe();
            }
            _this.subscriptions = [];
        });
        this.subscriptions = [
            this.errorMessageObservable.subscribe(function (message) {
                _this.$errorElement.text(message);
            }),
            this.valueObservable.subscribe(function (value) {
                $textArea.val(value);
                $textArea.trigger('change');
            })
        ];
        this.initialize($editorContainer[0], autofocus, value);
        var _a;
    };
    return JQueryXPathEditor;
}(xpath_editor_1.XPathEditor));
var xpathEditor = function (options) {
    return this.each(function () {
        var textArea = this;
        $(this).data('xpath-editor', new JQueryXPathEditor(textArea, options.macrosUrl));
    });
};
$.fn.extend({ xpathEditor: xpathEditor });
