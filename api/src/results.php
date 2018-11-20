<?php

require_once ROOT_PATH.'/functions.php';

require_once ROOT_PATH.'/basex-search-scripts/basex-client.php';
require_once ROOT_PATH.'/basex-search-scripts/metadata.php';
require_once ROOT_PATH.'/basex-search-scripts/treebank-search.php';

function getResults($xpath, $context, $corpus, $components, $start, $searchLimit, $variables = null, $remainingDatabases = null, $already = null)
{
    global $dbuser, $dbpwd, $flushLimit, $needRegularGrinded;

    // connect to BaseX
    if (isGrinded($corpus)) {
        $serverInfo = getServerInfo($corpus, $components[0]);
    } else {
        $serverInfo = getServerInfo($corpus, false);
    }

    $dbhost = $serverInfo['machine'];
    $dbport = $serverInfo['port'];
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

    if ($remainingDatabases != null) {
        $databases = $remainingDatabases;
    } else {
        $databases = corpusToDatabase($components, $corpus, $xpath);
    }

    if ($already == null) {
        $already = array();
        foreach ($databases as $database) {
            $already[$database] = 1;
        }
    }

    $results = getSentences($corpus, $databases, $components, $already, $start, $session, null, $searchLimit, $xpath, $context, $variables);
    if ($results[7] * $flushLimit >= $searchLimit) {
        // clear the remaining databases to signal the search is done
        $results[8] = array();
    }
    $session->close();
    $results[] = $already;
    $results[] = $needRegularGrinded;

    return $results;
}
