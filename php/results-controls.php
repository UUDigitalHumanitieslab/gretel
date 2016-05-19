<div class="dummy-controls" hidden>
    <div class="content">
    </div>
</div>
<nav class="controls">
    <p class="count"># of results: <span><strong>0</strong> / <span>--</span><span></p>
    <form><label for="go-to" class="disabled">Go to # <input type="text" id="go-to" name="go-to" pattern="[0-9]+" value="1" disabled></label></form>
    <label for="filter-components" class="disabled"><input type="checkbox" id="filter-components" name="filter-components" hidden disabled>Filter components <i class="fa fa-angle-down" aria-hidden="true"></i></label>
    <div class="filter-wrapper">
        <label class="disabled active" for="all-components"><i class="fa fa-check" aria-hidden="true"></i><input type="checkbox" id="all-components" name="all-components" checked disabled hidden>All</label>
        <?php foreach ($components as $comp) {
            echo '<label class="disabled"><input type="checkbox" name="component" value="'.strtoupper($comp).'" checked disabled> '.strtoupper($comp).'</label>';
        } ?>
    </div>
    <div class="loading-wrapper searching active">
        <div class="loading"></div>
    </div>
    <button class="stop" title="Pause the search process">Stop searching</button>
    <button class="continue" title="Continue searching" disabled>Continue searching</button>
    <button name="to-top" title="Go to the top of the page"><i class="fa fa-arrow-up"></i></button>
</nav>
