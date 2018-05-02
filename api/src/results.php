<?php

require_once ROOT_PATH.'/functions.php';

require_once ROOT_PATH.'/basex-search-scripts/basex-client.php';
require_once ROOT_PATH.'/basex-search-scripts/metadata.php';
require_once ROOT_PATH.'/basex-search-scripts/treebank-search.php';

function getResults($xpath, $context, $corpus, $components, $start, $searchLimit, $variables = null, $remainingDatabases = null)
{
    global $dbuser, $dbpwd;

    $already = array(); // TODO: unresolved Sonar behavior (see #81)

    // connect to BaseX
    if ($corpus == 'sonar') {
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
        $databases = corpusToDatabase($components, $corpus);
    }

    $results = getSentences($corpus, $databases, $already, $start, $session, null, $searchLimit, $xpath, $context, $variables);

    $session->close();

    return $results;
}
