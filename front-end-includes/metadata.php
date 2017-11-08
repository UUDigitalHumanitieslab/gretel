<?php

/**
 * Retrieves metadata from the $_GET variable and adds it to the $_SESSION,
 * and clears unused metadata from the $_SESSION.
 */
function retrieve_metadata()
{
    foreach ($_GET as $key => $value)
    {
        $_SESSION['m-' . $key] = $value;
    }
    foreach ($_SESSION as $key => $value)
    {
        if (substr($key, 0, 2) == 'm-' && !(in_array(substr($key, 2), array_keys($_GET))))
        {
            unset($_SESSION[$key]);
        }
    }
}

/**
 * Retrieves the metadata fields of the current corpus
 * @global string $corpus The current corpus
 * @return array All metadata fields
 */
function get_metadata_fields()
{
    global $corpus;

    $metadata = json_decode(file_get_contents(API_URL . '/treebank/metadata/' . $corpus));
    return array_map(function($m)
    {
        return $m->field;
    }, $metadata);
}

/**
 * Builds the xQuery metadata filter
 * @return string The metadata filter
 */
function get_metadata_filter($sid)
{
    $metadata_fields = get_metadata_fields();

    // Compile the filter
    $m_filter = '';
    foreach ($_SESSION[$sid] as $key => $value)
    {
        if (substr($key, 0, 2) != 'm-')
        {
            continue;
        }

        $key = substr($key, 2);
        if (in_array($key, $metadata_fields))
        {
            $values = explode('*', $value);

            // Single values
            if (count($values) == 1)
            {
                $m_filter .= '[ancestor::alpino_ds/metadata/meta'
                        . '[@name="' . $key . '" and '
                        . '@value="' . $values[0] . '"]] ';
            }
            // Ranged values
            else if (count($values) == 2)
            {
                $m_filter .= '[ancestor::alpino_ds/metadata/meta'
                        . '[@name="' . $key . '" and '
                        . '@value>="' . $values[0] . '" and '
                        . '@value<="' . $values[1] . '"]] ';
            }
        }
    }
    return $m_filter;
}

/**
 * Retrieves the metadata counts for the current corpus and xPath query.
 * @global string $corpus
 * @global array $components
 * @global string $xpath
 * @global string $dbuser
 * @global string $dbpwd
 * @return array Metadata per subcorpus
 */
function get_metadata_counts()
{
    global $corpus, $components, $xpath, $dbuser, $dbpwd;

    if ($corpus == 'sonar')
    {
        $serverInfo = getServerInfo($corpus, $components[0]);
    }
    else
    {
        $serverInfo = getServerInfo($corpus, false);
    }

    $dbhost = $serverInfo{'machine'};
    $dbport = $serverInfo{'port'};
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

    $result = array();
    foreach ($_SESSION['startDatabases'] as $database)
    {
        $xquery = '{
		  for $n
		  in (
			for $node
			in db:open("' . $database . '")' . $xpath . '
			return $node/ancestor::alpino_ds/metadata/meta)
		  let $k := $n/@name
		  let $t := $n/@type
		  group by $k, $t
		  order by $k, $t
		  return element {$k} {
			attribute type {$t},
			for $m in $n
			let $v := $m/@value
			group by $v
			return element value { attribute type {$v}, count($m) }
		  }
		}';

        $m_query = '<metadata>' . $xquery . '</metadata>';

        $query = $session->query($m_query);
        $result[$database] = $query->execute();
        $query->close();
    }
    $session->close();

    return $result;
}

/**
 * Shows all metadata facets
 */
function show_metadata_facets($corpus)
{
    $metadata = json_decode(file_get_contents(API_URL . '/treebank/metadata/' . $corpus));
    // First, combine the XMLs into an array with total counts over all databases
    $totals = array();
    foreach (get_metadata_counts() as $db => $m)
    {
        $xml = new SimpleXMLElement($m);
        foreach ($xml as $group => $counts)
        {
            $a2 = array();
            foreach ($counts as $k => $v)
            {
                $a2[(string) $v['type']] = (int) $v;
            }
            if (isset($totals[$group]))
            {
                $a1 = $totals[$group];
                $sums = array();
                foreach (array_keys($a1 + $a2) as $key)
                {
                    $sums[$key] = (isset($a1[$key]) ? $a1[$key] : 0) + (isset($a2[$key]) ? $a2[$key] : 0);
                }
                $totals[$group] = $sums;
            }
            else
            {
                $totals[$group] = $a2;
            }
        }
    }

    // Then, display those as facets
    foreach ($totals as $group => $counts)
    {
        // Fetch the details of this metadata group from the API
        $group_details = NULL;
        foreach ($metadata as $m)
        {
            if ($m->field == $group)
            {
                $group_details = $m;
                break;
            }
        }
        // If we haven't found the metadata in the API, it shouldn't show as a facet
        if (!$group_details)
        {
            continue;
        }
        // Build the facet
        echo '<div class="facet" id="' . htmlspecialchars($group) . '">';
        echo '<p><strong>' . htmlspecialchars($group) . '</strong></p>';
        // Date range
        if ($group_details->facet === 'date_range')
        {
            echo '<input class="facet-daterange" type="text" name="' . htmlspecialchars($group) . '_from" data-min="' . $group_details->min_value . '" data-max="' . $group_details->max_value . '" readonly>';
            echo '<input class="facet-daterange" type="text" name="' . htmlspecialchars($group) . '_to" data-min="' . $group_details->min_value . '" data-max="' . $group_details->max_value . '" readonly>';
        }
        // Slider
        else if ($group_details->facet === 'slider')
        {
            echo '<input class="facet-range" type="text" name="' . htmlspecialchars($group) . '" data-min="' . $group_details->min_value . '" data-max="' . $group_details->max_value . '" readonly>';
            echo '<div class="slider-range"></div>';
        }
        // Dropdown
        else if ($group_details->facet === 'dropdown')
        {
            echo '<select name="' . htmlspecialchars($group) . '">';
            echo '<option value="">';
            echo '--- show all ---';
            echo '</option>';
            foreach ($counts as $k => $v)
            {
                echo '<option value="' . htmlspecialchars($k) . '">';
                echo htmlspecialchars($k . ' (' . $v . ')');
                echo '</option>';
            }
            echo '</select>';
        }
        // Checkbox
        else
        {
            foreach ($counts as $k => $v)
            {
                echo '<input class="facet-value" type="checkbox" name="' . htmlspecialchars($k) . '">';
                echo htmlspecialchars($k . ' (' . $v . ')');
                echo '</input>';
                echo '<br/>';
            }
        }
        echo '</div>';
    }
}
