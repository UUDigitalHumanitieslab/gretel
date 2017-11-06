<?php
session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$currentPage = 'xps';
$step = 4;

require "../config.php";
require ROOT_PATH . "/helpers.php";

require ROOT_PATH . "/front-end-includes/metadata.php";
retrieve_metadata();

$_SESSION['ebsxps'] = $currentPage;
$id = session_id();
$noTbFlag = 0;

if (isset($_POST['treebank'])) {
    $corpus = $_POST['treebank'];
    $_SESSION['treebank'] = $corpus;
} elseif (isset($_SESSION['treebank'])) {
    $corpus = $_SESSION['treebank'];
} else {
    $noTbFlag = 1;
    $corpus = '';
}

if (isset($_POST['subtreebank'])) {
    $components = $_POST['subtreebank'];
    $_SESSION['subtreebank'] = $components;
} elseif (isset($_SESSION['subtreebank'])) {
    $components = $_SESSION['subtreebank'];
} else {
    $noTbFlag = 1;
}

$continueConstraints = !$noTbFlag && sessionVariablesSet(array('treebank', 'subtreebank', 'xpath'));
if ($continueConstraints) {
    require ROOT_PATH."/preparatory-scripts/prep-functions.php";
    $treeVisualizer = true;
    $onlyFullscreenTv = true;

    $xpath = $_SESSION['xpath'];
    // Need to clean in case the user goes back in history, otherwise the
    // prepended slashes below would keep stacking on each back-and-forward
    // in history
    $xpath = cleanXpath($xpath);

    $_SESSION['ct'] = isset($_POST['ct']) ? true : false;
    $_SESSION['endPosIteration'] = 0;
    $_SESSION['startDatabases'] = array();

    if ($corpus == 'sonar') {
        $databaseExists = false;
    }

    $needRegularSonar = false;
}

session_write_close();

require ROOT_PATH . "/functions.php";
require ROOT_PATH . "/front-end-includes/head.php";

if ($continueConstraints) {
    require ROOT_PATH . "/basex-search-scripts/treebank-search.php";
    require ROOT_PATH . "/basex-search-scripts/basex-client.php";
    session_start();
    if ($corpus == 'sonar') {
        $bf = xpathToBreadthFirst($xpath);
        // Get correct databases to start search with, sets to
        // $_SESSION['startDatabases']
        checkBfPattern($bf);

        // When looking in the regular version we need the double slash to go through
        // all descendants
        if ($needRegularSonar) {
            $xpath = "//$xpath";
        } else {
            $xpath = "/$xpath";
        }
    } else {
        $xpath = "//$xpath";
        $_SESSION['startDatabases'] = corpusToDatabase($components, $corpus);
    }
    
    session_write_close();
}
?>
</head>
<?php 
flush();

require ROOT_PATH . "/front-end-includes/header.php";
require ROOT_PATH . "/front-end-includes/analysis.php";
$analysis = new Analysis();
$analysis->continueConstraints = $continueConstraints;
$analysis->corpus = $corpus;
if (isset($_POST["xpath-variables"])) {
    $analysis->variables = $_POST["xpath-variables"];
}
$analysis->render();

require ROOT_PATH."/front-end-includes/footer.php";
include ROOT_PATH."/front-end-includes/analytics-tracking.php";
?>
</body>
</html>
