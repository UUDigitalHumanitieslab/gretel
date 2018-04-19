"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var xpath_extractinator_1 = require("../../services/xpath-extractinator");
var $ = require("jquery");
var rxjs_1 = require("rxjs");
var ts_xpath_1 = require("ts-xpath");
var XPathVariablesRenderer = /** @class */ (function () {
    function XPathVariablesRenderer(element, source, formName) {
        var _this = this;
        this.subject = new rxjs_1.BehaviorSubject('');
        this.variables = this.subject.debounceTime(50).map(function (xpath) { return _this.extract(xpath); }).filter(function (variables) { return variables != null; });
        var $element = $(element);
        this.source = $(source);
        this.view = new View(formName, $element);
        this.variables.subscribe(function (variables) {
            _this.view.render(variables);
        });
        // make sure any initial value is rendered
        this.update();
        this.source.on('change keyup', function (evt) { return _this.update(); });
        this.extractinator = new xpath_extractinator_1.XPathExtractinator();
    }
    XPathVariablesRenderer.prototype.update = function () {
        this.subject.next(this.source.val());
    };
    XPathVariablesRenderer.prototype.extract = function (xpath) {
        try {
            return this.extractinator.extract(xpath);
        }
        catch (error) {
            if (!(error instanceof ts_xpath_1.XPathModels.ParseError || error instanceof xpath_extractinator_1.FormatError)) {
                throw error;
            }
        }
        return null;
    };
    return XPathVariablesRenderer;
}());
exports.XPathVariablesRenderer = XPathVariablesRenderer;
var xpathVariables = function (options) {
    return this.each(function () {
        var target = this;
        $(this).data('xpath-editor', new XPathVariablesRenderer(target, options.source, options.formName));
    });
};
$.fn.extend({ xpathVariables: xpathVariables });
var View = /** @class */ (function () {
    function View(formName, target) {
        var _this = this;
        this.formName = formName;
        this.target = target;
        this.renderedLength = 0;
        this.names = [];
        this.paths = [];
        this.renderItem = function (index) {
            var nameInput = $("<input type=\"hidden\" name=\"" + _this.formName + "[" + index + "][name]\" />");
            var pathInput = $("<input type=\"hidden\" name=\"" + _this.formName + "[" + index + "][path]\" />");
            _this.target.append(nameInput);
            _this.target.append(pathInput);
            _this.names.push(nameInput);
            _this.paths.push(pathInput);
        };
    }
    View.prototype.render = function (items) {
        if (!items) {
            return;
        }
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
