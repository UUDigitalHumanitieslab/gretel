<div class="dummy-controls" hidden>
    <div class="content">
    </div>
</div>
<nav class="controls">
    <p class="count"># of results: <strong>0</strong> / <span>--</span></p>
    <form><label for="go-to" class="disabled">Go to # <input type="text" id="go-to" name="go-to" pattern="[0-9]+" value="1" disabled></label></form>
    <label for="filter-components" class="disabled" title="Only show results of specific components. Note that when you download the output, filters are not taken into account: all results are downloaded">
      <input type="checkbox" id="filter-components" name="filter-components" hidden disabled>Filter components <i class="fa fa-angle-down" aria-hidden="true"></i>
    </label>
    <div class="filter-wrapper">
        <label class="disabled active" for="all-components"><i class="fa fa-check" aria-hidden="true"></i><input type="checkbox" id="all-components" name="all-components" checked disabled hidden>All</label>
        <?php foreach ($components as $comp) {
            echo '<label class="disabled"><input type="checkbox" name="component" value="'.strtoupper($comp).'" checked disabled> '.strtoupper($comp).'</label>';
        } ?>
    </div>
    <div class="loading-wrapper searching active">
        <div class="loading"></div>
    </div>
    <button name="to-top" title="Go to the top of the page"><i class="fa fa-arrow-up"></i></button>
</nav>
