<?php

require '../basex-search-scripts/metadata.php';

/**
 * Shows all metadata facets.
 */
function show_metadata_facets($corpus, $sid)
{
    global $components, $xpath;
    $metadata = json_decode(file_get_contents(API_URL.'/treebank/metadata/'.$corpus));
    // First, get an array with total counts over all databases
    $totals = get_metadata_counts($corpus, $components, $xpath);

    // Then, display those as facets
    foreach ($totals as $group => $counts) {
        // Fetch the details of this metadata group from the API
        $group_details = null;
        foreach ($metadata as $m) {
            if ($m->field == $group) {
                $group_details = $m;
                break;
            }
        }
        // If we haven't found the metadata in the API, it shouldn't show as a facet
        if (!$group_details) {
            continue;
        }
        // Build the facet
        echo '<div class="facet" id="'.htmlspecialchars($group).'">';
        echo '<p><strong>'.htmlspecialchars($group).'</strong></p>';
        // Date range
        if ($group_details->facet === 'date_range') {
            echo '<input class="facet-daterange" type="text" name="'.htmlspecialchars($group).'_from" data-min="'.$group_details->min_value.'" data-max="'.$group_details->max_value.'" readonly>';
            echo '<input class="facet-daterange" type="text" name="'.htmlspecialchars($group).'_to" data-min="'.$group_details->min_value.'" data-max="'.$group_details->max_value.'" readonly>';
        }
        // Slider
        elseif ($group_details->facet === 'slider') {
            echo '<input class="facet-range" type="text" name="'.htmlspecialchars($group).'" data-min="'.$group_details->min_value.'" data-max="'.$group_details->max_value.'" readonly>';
            echo '<div class="slider-range"></div>';
        }
        // Dropdown
        elseif ($group_details->facet === 'dropdown') {
            echo '<select name="'.htmlspecialchars($group).'">';
            echo '<option value="">';
            echo '--- show all ---';
            echo '</option>';
            foreach ($counts as $k => $v) {
                echo '<option value="'.htmlspecialchars($k).'">';
                echo htmlspecialchars($k.' ('.$v.')');
                echo '</option>';
            }
            echo '</select>';
        }
        // Checkbox
        else {
            foreach ($counts as $k => $v) {
                echo '<input class="facet-value" type="checkbox" name="'.htmlspecialchars($k).'">';
                echo htmlspecialchars($k.' ('.$v.')');
                echo '</input>';
                echo '<br/>';
            }
        }
        echo '</div>';
    }
}
