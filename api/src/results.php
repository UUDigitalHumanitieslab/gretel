<?php
ini_set('memory_limit', '2G'); // BRING IT ON!

require_once ROOT_PATH.'/functions.php';

require_once ROOT_PATH.'/basex-search-scripts/basex-client.php';
require_once ROOT_PATH.'/basex-search-scripts/metadata.php';
require_once ROOT_PATH.'/basex-search-scripts/treebank-search.php';

/**
 * @param string $xpath
 * @param boolean $context retrieve preceding and following sentences?
 * @param string $corpus treebank to search
 * @param string $component the component we're searching
 * @param string[] $databases list of databases that remain to be searched in this component.
 * @param int $start pagination info, hits to skip in current database
 * @param int $searchLimit
 * @param array $variables
 * @return void
 */
function getResults($xpath, $context, $corpus, $component, $databases, $start, $searchLimit, $variables = null)
{
    // connect to BaseX
    $serverInfo = getServerInfo($corpus, $component);
    $session = new Session($serverInfo['machine'], $serverInfo['port'], $serverInfo['username'], $serverInfo['password']);

    $results = getSentences($corpus, $component, $databases, $start, $session, $searchLimit, $xpath, $context, $variables);
    $session->close();

    if (!$results['success']) {
        // no results, only contains false success state and the xquery (for debugging)
        return $results;
    }

    return $results;
}
