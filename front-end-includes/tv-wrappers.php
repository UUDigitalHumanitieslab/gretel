<?php if (!$onlyFullscreenTv): ?>
    <div id="tree-visualizer" class="tv">
        <div class="tv-error" style="display: none">
            <p></p>
        </div>
        <div class="tv-content-wrapper">
            <div class="tv-toolbar-wrapper">
                <div class="tv-sentence-wrapper"><span></span></div>
                <button class="tv-show-fs" title="Open the tree in full screen mode" type="button">
                    <i class="fa fa-fw fa-arrows-alt fa-loaded"></i>
                    <span class="sr-only">Open in fullscreen</span>
                </button>
            </div>
            <div class="tv-tree">
                <aside class="tv-tooltip" style="display: none">
                    <ul></ul>
                    <button title="Close this tooltip" type="button"><i class="fa fa-fw fa-times fa-loaded"></i><span class="sr-only">Close</span></button>
                </aside>
            </div>
        </div>
    </div>
<?php endif; ?>

<div id="tree-visualizer-fs" class="tv tv-fs">
    <div class="tv-error" style="display: none">
        <p></p>
    </div>
    <div class="tv-content-wrapper">
        <div class="tv-toolbar-wrapper">
            <div class="tv-sentence-wrapper"><span></span></div>
            <div class="tv-zoom-wrapper">
                <a href="#" target="_blank" title="Show XML">Show XML</a>
                <div class="tv-zoom-opts">
                    <button class="tv-zoom-out" type="button">
                        <i class="fa fa-fw fa-search-minus fa-loaded" aria-hidden="true"></i>
                        <span class="sr-only">Zoom out</span>
                    </button>
                    <button class="tv-zoom-default" type="button">Default</button>
                    <button class="tv-zoom-in" type="button">
                        <i class="fa fa-fw fa-search-plus fa-loaded" aria-hidden="true"></i>
                        <span class="sr-only">Zoom in</span>
                    </button>

                    <button title="Close fullscreen mode" type="button" class="tv-close-fs">
                        <i class="fa fa-fw fa-times fa-loaded"></i>
                        <span class="sr-only">Close</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="tv-tree">
            <aside class="tv-tooltip" style="display: none">
                <ul></ul>
                <button title="Close this tooltip" type="button"><i class="fa fa-fw fa-times fa-loaded"></i><span class="sr-only">Close</span></button>
            </aside>
        </div>
    </div>
    <div class="tv-loading-wrapper">
        <div class="loading"><p>Loading tree...<br>Please wait</p></div>
    </div>
</div>
