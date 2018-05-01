<?php

require_once ROOT_PATH.'/functions.php';

require_once ROOT_PATH.'/basex-search-scripts/basex-client.php';
require_once ROOT_PATH.'/basex-search-scripts/metadata.php';
require_once ROOT_PATH.'/basex-search-scripts/treebank-count.php';

function getTreebankCounts($corpus, $components, $xpath)
{
    global $dbuser, $dbpwd;

    if ($corpus == 'sonar') {
        $serverInfo = getServerInfo($corpus, $components[0]);
    } else {
        $serverInfo = getServerInfo($corpus, false);
    }

    $already = array(); // TODO: unresolved Sonar behavior (see #81)
    $databases = corpusToDatabase($components, $corpus);

    $dbhost = $serverInfo['machine'];
    $dbport = $serverInfo['port'];
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

    list($sum, $counts) = getCounts($databases, $already, $session, $xpath, $corpus);

    $session->close();

    return $counts;
}
