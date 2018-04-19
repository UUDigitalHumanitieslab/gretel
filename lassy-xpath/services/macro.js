"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../common/index");
/**
 * The macro service is used to replace macro variables in the XPATH with the macro value.
 * This is done using the same syntax as used by PaQU e.g. `%PQ_example%`.
 */
var Macro = /** @class */ (function () {
    function Macro() {
        var _this = this;
        /**
         * Waits for the definitions to be loaded
         */
        this.onceLoaded = new Promise(function (resolve, reject) {
            _this.loaded = function () {
                resolve();
                _this.loaded = function () { };
            };
        });
    }
    Macro.prototype.loadDefault = function () {
        return this.loadFromText(index_1.DefaultMacros);
    };
    /**
     * Loads the macro definitions from the passed text data.
     * @param data The definitions to load.
     */
    Macro.prototype.loadFromText = function (data) {
        Macro.macroLookup = this.parseValues(data);
        this.loaded();
    };
    Macro.prototype.getMacros = function () {
        return Macro.macroLookup;
    };
    /**
     * Find all the macro references in the specified XPATH and returns their replacements.
     * @param value
     * @returns The replacements which were performed (should be repeated sequentially) and the replacement results,
     * if no replacements were performed the result is false.
     */
    Macro.prototype.enrich = function (value) {
        var macroCalls = /%([^\%\s]+)%/g;
        var macroCall;
        var result = [''];
        var appendResult = function (text) {
            result.splice.apply(result, [result.length - 1,
                1].concat((result[result.length - 1] + text).split('\n')));
        };
        var macroReplacements = [];
        var lastIndex = 0;
        while ((macroCall = macroCalls.exec(value)) != null) {
            var replacement = void 0;
            try {
                replacement = Macro.macroLookup[macroCall[1]].trim();
            }
            catch (error) {
                console.warn("Unknown macro call? " + macroCall[1]);
                console.warn(error);
                continue;
            }
            appendResult(value.substring(lastIndex, macroCall.index));
            // enrich again! macros can also contain macro calls!
            // perform any recursion directly, don't let the editor do this heavy work
            replacement = this.enrich(replacement).result || replacement;
            var callLength = macroCall[1].length + 2;
            macroReplacements.push({
                offset: result[result.length - 1].length,
                line: result.length - 1,
                length: callLength,
                value: replacement
            });
            appendResult(replacement);
            lastIndex = macroCall.index + callLength;
        }
        return {
            replacements: macroReplacements,
            result: macroReplacements.length ? result.join('\n') + value.substring(lastIndex) : false
        };
    };
    /**
     * Parses the macro definition text and returns all the macro names and their replacement values.
     * The macro definition should contain macro names (e.g. PQ_example) followed by the value to
     * place in the XPATH instead of this macro call, which is surrounded by """.
     * @param data The macro definition text
     */
    Macro.prototype.parseValues = function (data) {
        var macroLookup = {};
        var macroPattern = /\b(.*)\b\s*=\s*"""([\s\S]*?)"""/g;
        var match;
        while ((match = macroPattern.exec(data)) != null) {
            macroLookup[match[1]] = match[2];
        }
        return macroLookup;
    };
    /**
     * defined statically, to make it available in the XPATH mode
     */
    Macro.macroLookup = {};
    return Macro;
}());
exports.Macro = Macro;
