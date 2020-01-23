<?php

ini_set('memory_limit', '2G'); // BRING IT ON!

require_once ROOT_PATH.'/functions.php';

require_once ROOT_PATH.'/basex-search-scripts/basex-client.php';
require_once ROOT_PATH.'/basex-search-scripts/metadata.php';
require_once ROOT_PATH.'/basex-search-scripts/treebank-search.php';

/**
 * @param string   $xpath
 * @param bool     $context     retrieve preceding and following sentences?
 * @param string   $corpus      treebank to search
 * @param string[] $components  the component we're searching
 * @param string[] $databases   list of databases that remain to be searched in this component
 * @param int      $start       pagination info, hits to skip in current database
 * @param int      $searchLimit max number of results to retrieve in this call
 * @param array    $variables
 * @param Session  $session     re-use the session if possible
 */
function getResults($xpath, $context, $corpus, $components, $databases, $start, $searchLimit, $variables = null, $session = null)
{
    // connect to BaseX
    $serverInfo = getServerInfo($corpus, $components[0]);
    if ($session == null) {
        $session = new Session($serverInfo['machine'], $serverInfo['port'], $serverInfo['username'], $serverInfo['password']);
        $newSession = true;
    } else {
        $newSession = false;
    }

    if ($databases == null) {
        $databases = getDatabases($corpus, $components[0], $xpath);
    }
    $results = getSentences($corpus, $components[0], $databases, $start, $session, $searchLimit, $xpath, $context, $variables);

    if (!$results['success']) {
        // no results, only contains false success state and the xquery (for debugging)
        // are there still components left?

        array_shift($components);
        if ($components) {
            $databases = null;
            $start = 0;
            $results = getResults($xpath, $context, $corpus, $components, $databases, $start, $searchLimit, $variables, $session);
        }
    } else {
        if (!$results['remainingDatabases']) {
            // If done with current components (remainingDatabases finished)
            // Remove it from the list and get the databases for the next components
            array_shift($components);
            $results['remainingDatabases'] = isset($components[0])
                ? getDatabases($corpus, $components[0], $xpath)
                : array();
        }
        $results['remainingComponents'] = $components;
    }

    if ($newSession) {
        $session->close();
    }

    return $results;
}
