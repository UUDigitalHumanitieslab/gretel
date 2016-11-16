<nav class="controls">
    <span class="count"># of results: <strong>0</strong> / <span>--</span></span>

    <span class="status"><span>Searching</span><span>Counting</span></span>

    <div class="filter-wrapper">
        <label for="filter-components" class="disabled" title="Only show results of specific components. Note that when you download the output, filters are not taken into account: all results are downloaded">
          <input type="checkbox" id="filter-components" name="filter-components" hidden disabled>Filter components <i class="fa fa-fw fa-angle-down" aria-hidden="true"></i>
        </label>
        <div class="filter-sel-wrapper">
            <label class="disabled active" for="all-components"><i class="fa fa-fw fa-check" aria-hidden="true"></i><input type="checkbox" id="all-components" name="all-components" checked disabled hidden>All</label>
            <?php foreach ($components as $comp) {
                echo '<label class="disabled"><input type="checkbox" name="component" value="'.strtoupper($comp).'" checked disabled> '.strtoupper($comp).'</label>';
            } ?>
        </div>
    </div>
    <div class="searching-animation">
        <div></div>
    </div>
</nav>
