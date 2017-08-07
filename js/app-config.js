require.config({
    paths: {
        "rxjs": "packages/Rx",
        "pivottable": "packages/pivottable"
    }
});
define(["require", "exports", "./ts/components-renderer"], function (require, exports, components_renderer) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var renderer = new components_renderer.ComponentsRenderer();
    renderer.render();
});
