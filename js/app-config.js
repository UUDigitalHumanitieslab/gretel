require.config({
    paths: {
        "ace": "packages/ace",
        "rxjs": "packages/Rx",
        "pivottable": "packages/pivottable"
    }
});
define('jquery', [], function () {
    return jQuery;
});
define(["require", "exports", "./ts/components-renderer"], function (require, exports, components_renderer) {
    Object.defineProperty(exports, "__esModule", { value: true });
    require("ace/config").set("basePath", "js/packages/ace");
    require("ace/config").set("packaged", true);
    var renderer = new components_renderer.ComponentsRenderer();
    renderer.render();
});
