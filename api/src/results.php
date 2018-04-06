<?php

require ROOT_PATH.'/functions.php';

require ROOT_PATH.'/basex-search-scripts/basex-client.php';
require ROOT_PATH.'/basex-search-scripts/treebank-search.php';

function getResults($xpath, $context, $corpus, $components, $start, $searchLimit, $variables = null)
{
    global $dbuser, $dbpwd;

    $already = array(); // TODO: what is going on here?

    // connect to BaseX
    if ($corpus == 'sonar') {
        $serverInfo = getServerInfo($corpus, $components[0]);
    } else {
        $serverInfo = getServerInfo($corpus, false);
    }

    $dbhost = $serverInfo['machine'];
    $dbport = $serverInfo['port'];
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

    $databases = corpusToDatabase($components, $corpus);

    $results = getSentences($corpus, $databases, $already, $start, $session, null, $searchLimit, $xpath, $context, $variables);

    $session->close();

    return $results;
}
