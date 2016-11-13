<?php

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

require '../config/config.php';
require "$root/functions.php";

require "$root/basex-search-scripts/basex-client.php";
require "$root/basex-search-scripts/treebank-count.php";
require "$root/basex-search-scripts/treebank-search.php";

session_start();
set_time_limit(0);

$id = session_id();

$xpath = $_SESSION['xpath'];
$corpus = $_SESSION['treebank'];
$components = $_SESSION['subtreebank'];

$databases = $_SESSION['startDatabases'];

if ($corpus == 'sonar') {
    $needRegularSonar = $_SESSION['needRegularSonar'];
}

session_write_close();

if ($corpus == 'sonar') {
    $serverInfo = getServerInfo($corpus, $components[0]);
} else {
    $serverInfo = getServerInfo($corpus, false);
}

$dbhost = $serverInfo{'machine'};
$dbport = $serverInfo{'port'};
$session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

list($sum, $counts) = getCounts($xpath, $corpus, $components, $databases, $session);

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
echo json_encode(array($sum, $counts));
