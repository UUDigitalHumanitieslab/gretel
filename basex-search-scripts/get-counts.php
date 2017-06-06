<?php

require "../config.php";
require ROOT_PATH."/functions.php";

require ROOT_PATH."/basex-search-scripts/basex-client.php";
require ROOT_PATH."/basex-search-scripts/treebank-count.php";
require ROOT_PATH."/basex-search-scripts/treebank-search.php";

session_start();
set_time_limit(0);

$id = session_id();

$xpath = $_SESSION['xpath'];
$corpus = $_SESSION['treebank'];
$components = $_SESSION['subtreebank'];
$already = $databases = $_SESSION['startDatabases'];

if ($corpus == 'sonar') {
    $needRegularSonar = $_SESSION['needRegularSonar'];
}

session_write_close();

try {
    if ($corpus == 'sonar') {
        $serverInfo = getServerInfo($corpus, $components[0]);
    } else {
        $serverInfo = getServerInfo($corpus, false);
    }

    $dbhost = $serverInfo{'machine'};
    $dbport = $serverInfo{'port'};
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

    list($sum, $counts) = getCounts($databases, $already, $session);

    $session->close();

    if ($corpus != 'sonar') {
        // Add a distribution to the list:
        // Instead of simply returning the amount of hits, return an array of
        // each database with the amounts of hits per database, and the total
        // # of sentences for that database
        $total = getTotalSentences($corpus);
        foreach ($counts as $database => $dbCount) {
            $counts{$database} = array($dbCount, $total[$database]);
        }
        createCsvCounts($sum, $counts);
    }

    header_remove('Set-Cookie');
    $results = array(
      'sum' => $sum,
      'counts' => $counts
    );
    echo json_encode($results);
} catch (Exception $e) {
    $results = array(
      'error' => true,
      'data' => $e->getMessage(),
    );
    header_remove('Set-Cookie');
    echo json_encode($results);
}
