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
var macro_1 = require("./macro");
/**
 * The macro service is used to replace macro variables in the XPATH with the macro value.
 * This is done using the same syntax as used by PaQU e.g. `%PQ_example%`.
 */
var MacroService = /** @class */ (function (_super) {
    __extends(MacroService, _super);
    function MacroService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Loads the macro definitions from a URL.
     * @param url The URL of the macro definitions
     */
    MacroService.prototype.loadFromUrl = function (url) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            $.get(url, function (data) {
                _this.loadFromText(data);
                resolve();
            });
        });
    };
    return MacroService;
}(macro_1.Macro));
exports.MacroService = MacroService;
