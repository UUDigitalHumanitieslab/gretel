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
 
$continueConstraints = sessionVariablesSet($_POST['sid'], array('treebank', 'subtreebank', 'xpath'));
if ($continueConstraints) {
    define('SID', $_POST['sid']);
    $_SESSION[SID]['ebsxps'] = $currentPage;
    require ROOT_PATH."/preparatory-scripts/prep-functions.php";

    $treeVisualizer = true;
    $onlyFullscreenTv = true;
    $corpus = $_SESSION[SID]['treebank'];
    $components = $_SESSION[SID]['subtreebank'];
    $xpath = $_SESSION[SID]['xpath'];

    // Need to clean in case the user goes back in history, otherwise the
    // prepended slashes below would keep stacking on each back-and-forward
    // in history
    $xpath = cleanXpath($xpath);

    $_SESSION[SID]['ct'] = isset($_POST['ct']) ? true : false;
    $_SESSION[SID]['endPosIteration'] = 0;
    $_SESSION[SID]['startDatabases'] = array();

    if ($corpus == 'sonar') {
        $databaseExists = false;
    }

    $needRegularSonar = false;
}
require ROOT_PATH . "/functions.php";
require ROOT_PATH . "/front-end-includes/head.php";

if ($continueConstraints) {
    require ROOT_PATH . "/basex-search-scripts/treebank-search.php";
    require ROOT_PATH . "/basex-search-scripts/basex-client.php";
    
    if ($corpus == 'sonar') {
        $bf = xpathToBreadthFirst($xpath);
        // Get correct databases to start search with, sets to
        // $_SESSION['startDatabases']
        checkBfPattern($bf, SID);

        // When looking in the regular version we need the double slash to go through
        // all descendants
        if ($needRegularSonar) {
            $xpath = "//$xpath";
        } else {
            $xpath = "/$xpath";
        }
    } else {
        $xpath = "//$xpath";
        $_SESSION[SID]['startDatabases'] = corpusToDatabase($components, $corpus);
    }
}

session_write_close();
?>
</head>
<?php 
flush();

require ROOT_PATH . "/front-end-includes/header.php";
require ROOT_PATH . "/front-end-includes/analysis.php";
if ($continueConstraints) {
    $analysis = new Analysis();
    $analysis->continueConstraints = $continueConstraints;
    $analysis->corpus = $corpus;
    $analysis->SID = SID;
    if (isset($_POST["xpath-variables"])) {
        $analysis->variables = $_POST["xpath-variables"];
    }
    $analysis->render();
}
require ROOT_PATH."/front-end-includes/footer.php";
include ROOT_PATH."/front-end-includes/analytics-tracking.php";
?>
</body>
</html>
