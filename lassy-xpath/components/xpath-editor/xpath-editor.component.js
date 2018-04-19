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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var xpath_editor_1 = require("./xpath-editor");
var _ng_1 = require("../../services/_ng");
var XPathEditorComponent = /** @class */ (function (_super) {
    __extends(XPathEditorComponent, _super);
    function XPathEditorComponent(xpathParserService, macroService) {
        var _this = _super.call(this, xpathParserService, macroService) || this;
        _this.onChange = new core_1.EventEmitter();
        return _this;
    }
    XPathEditorComponent.prototype.ngOnDestroy = function () {
        for (var _i = 0, _a = this.subscriptions; _i < _a.length; _i++) {
            var subscription = _a[_i];
            subscription.unsubscribe();
        }
        this.subscriptions = [];
    };
    XPathEditorComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.initialize(this.container.nativeElement, this.autofocus || false, this.value);
        this.subscriptions = [
            this.valueObservable.subscribe(function (value) {
                _this.value = value;
                _this.emitChange();
            }),
            this.errorMessageObservable.subscribe(function (message) {
                _this.errorMessage = message;
                _this.emitChange();
            })
        ];
    };
    XPathEditorComponent.prototype.emitChange = function () {
        this.onChange.next({
            xpath: this.value,
            error: this.errorMessage
        });
    };
    __decorate([
        core_1.ViewChild('container'),
        __metadata("design:type", core_1.ElementRef)
    ], XPathEditorComponent.prototype, "container", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", Boolean)
    ], XPathEditorComponent.prototype, "autofocus", void 0);
    __decorate([
        core_1.Input(),
        __metadata("design:type", String)
    ], XPathEditorComponent.prototype, "value", void 0);
    __decorate([
        core_1.Output(),
        __metadata("design:type", Object)
    ], XPathEditorComponent.prototype, "onChange", void 0);
    XPathEditorComponent = __decorate([
        core_1.Component({
            selector: 'lx-editor',
            template: "<div #container></div><p class=\"error-message\">{{errorMessage}}</p>",
            styles: [
                ".error-message {\n            color: #d54a4a;\n            display: inline-block;\n            min-height: 1.5em;\n        }"
            ]
        }),
        __metadata("design:paramtypes", [_ng_1.LassyXPathParserService, _ng_1.MacroService])
    ], XPathEditorComponent);
    return XPathEditorComponent;
}(xpath_editor_1.XPathEditor));
exports.XPathEditorComponent = XPathEditorComponent;
