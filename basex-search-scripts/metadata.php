<?php

require_once 'treebank-search.php';

/**
 * Retrieves metadata from the $_GET variable and adds it to the $_SESSION,
 * and clears unused metadata from the $_SESSION.
 */
function retrieve_metadata()
{
    foreach ($_GET as $key => $value) {
        $_SESSION['m-'.$key] = $value;
    }
    foreach ($_SESSION as $key => $value) {
        if (substr($key, 0, 2) == 'm-' && !(in_array(substr($key, 2), array_keys($_GET)))) {
            unset($_SESSION[$key]);
        }
    }
}

/**
 * Retrieves the metadata fields of the current corpus.
 *
 * @global string $corpus The current corpus
 *
 * @return array All metadata fields
 */
function get_metadata_fields()
{
    global $corpus;

    $metadata = json_decode(file_get_contents(API_URL.'/treebank/metadata/'.$corpus));

    return array_map(function ($m) {
        return $m->field;
    }, $metadata);
}

/**
 * Builds the xQuery metadata filter.
 *
 * @return string The metadata filter
 */
function get_metadata_filter($sid)
{
    $metadata_fields = get_metadata_fields();

    // Compile the filter
    $m_filter = '';
    foreach ($_SESSION[$sid] as $key => $value) {
        if (substr($key, 0, 2) != 'm-') {
            continue;
        }

        $key = substr($key, 2);
        if (in_array($key, $metadata_fields)) {
            $values = explode('*', $value);

            // Single values
            if (count($values) == 1) {
                $m_filter .= '[ancestor::alpino_ds/metadata/meta'
                        .'[@name="'.$key.'" and '
                        .'@value="'.$values[0].'"]] ';
            }
            // Ranged values
            elseif (count($values) == 2) {
                $m_filter .= '[ancestor::alpino_ds/metadata/meta'
                        .'[@name="'.$key.'" and '
                        .'@value>="'.$values[0].'" and '
                        .'@value<="'.$values[1].'"]] ';
            }
        }
    }

    return $m_filter;
}

/**
 * Retrieves the metadata counts for the current corpus and XPath query.
 *
 * @param string $corpus
 * @param array  $components
 * @param string $xpath
 *
 * @global string $dbuser
 * @global string $dbpwd
 *
 * @return array Metadata per subcorpus
 */
function get_metadata_counts($corpus, $components, $xpath)
{
    global $dbuser, $dbpwd;

    if (isGrinded($corpus)) {
        $serverInfo = getServerInfo($corpus, $components[0]);
    } else {
        $serverInfo = getServerInfo($corpus, false);
    }

    $databases = corpusToDatabase($components, $corpus, $xpath);

    $dbhost = $serverInfo['machine'];
    $dbport = $serverInfo['port'];
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

    $result = array();
    foreach ($databases as $database) {
        $xquery = '{
            for $n
            in (
                for $node
                in db:open("'.$database.'")'.$xpath.'
                return $node/ancestor::alpino_ds/metadata/meta)
            let $k := $n/@name
            let $t := $n/@type
            group by $k, $t
            order by $k, $t

            return element meta {
                attribute name {$k},
                attribute type {$t},
                for $m in $n
                let $v := $m/@value
                group by $v
                return element count { 
                    attribute value {$v}, count($m)
                }
            }
        }';

        $m_query = '<metadata>'.$xquery.'</metadata>';

        $query = $session->query($m_query);
        $result[$database] = $query->execute();
        $query->close();
    }
    $session->close();

    // Combine the XMLs into an array with total counts over all databases
    $totals = array();
    foreach ($result as $db => $m) {
        $xml = new SimpleXMLElement($m);
        foreach ($xml as $group => $counts) {
            $name = (string) $counts['name'];
            $a2 = array();
            foreach ($counts as $k => $v) {
                $a2[(string) $v['value']] = (int) $v;
            }
            if (isset($totals[$name])) {
                $a1 = $totals[$name];
                $sums = array();
                foreach (array_keys($a1 + $a2) as $key) {
                    $sums[$key] = (isset($a1[$key]) ? $a1[$key] : 0) + (isset($a2[$key]) ? $a2[$key] : 0);
                }
                $totals[$name] = $sums;
            } else {
                $totals[$name] = $a2;
            }
        }
    }

    return $totals;
}
