<?php
session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$currentPage = 'ebs';
$step = 6;

require "../config.php";
require ROOT_PATH . "/helpers.php";

require ROOT_PATH . "/front-end-includes/metadata.php";
require ROOT_PATH . "/front-end-includes/xpath-variables-hidden.php";
retrieve_metadata();

$_SESSION['ebsxps'] = $currentPage;
$id = session_id();

$continueConstraints = sessionVariablesSet(array('treebank', 'queryid', 'example', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    require ROOT_PATH . "/preparatory-scripts/prep-functions.php";

    $treeVisualizer = true;
    $onlyFullscreenTv = true;
    $corpus = $_SESSION['treebank'];
    $components = $_SESSION['subtreebank'];
    $xpath = $_SESSION['originalXp'] . get_metadata_filter();
    $originalXp = $_SESSION['originalXp'];

    // Need to clean in case the user goes back in history, otherwise the
    // prepended slashes below would keep stacking on each back-and-forward
    // in history
    $xpath = cleanXpath($xpath);
    $originalXp = cleanXpath($originalXp);
    $example = $_SESSION['example'];

    $context = $_SESSION['ct'];
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
            $originalXp = "//$originalXp";
        } else {
            $xpath = "/$xpath";
            $originalXp = "/$originalXp";
        }
    } else {
        $xpath = "//$xpath";
        $originalXp = "//$originalXp";
        $_SESSION['startDatabases'] = corpusToDatabase($components, $corpus);
    }

  // When flushing we update the databases on each iteration, not so in counting
  // or when fetching all results
    $_SESSION['flushAlready'] = $_SESSION['flushDatabases'] = $_SESSION['startDatabases'];
    $_SESSION['xpath'] = $xpath;
    $_SESSION['originalXp'] = $originalXp;
    $_SESSION['needRegularSonar'] = $needRegularSonar;
    session_write_close();
}
?>
</head>
<?php
flush();

require ROOT_PATH . "/front-end-includes/header.php";

if ($continueConstraints) {
    require ROOT_PATH."/front-end-includes/results-shared-content.php";
    echo '<form action="ebs/analysis.php" method="post">';
    setContinueNavigation();
    render_xpath_variables_hidden("xpath-variables");
    echo '</form>';
} else {
    if (isset($databaseExists) && !$databaseExists) {
        setErrorHeading('No results found'); ?>
        <p>The query you constructed did not yield any results. Such a structure does not exist in the selected component.</p>
        <?php
    } else {
        setErrorHeading();
    ?>
    <p>Something went wrong. It is possible that you came to this page directly without entering the required fields in the previous steps.</p>
    <?php
    setPreviousPageMessage(4);
    }
}
require ROOT_PATH . "/front-end-includes/footer.php";
include ROOT_PATH . "/front-end-includes/analytics-tracking.php";

if ($continueConstraints) {
    include ROOT_PATH."/front-end-includes/notifications.php";
    // Variables for JS
    $jsVars = array(
        'fetchResultsPath' => HOME_PATH."/basex-search-scripts/flush-results.php",
        'getAllResultsPath' => HOME_PATH."/basex-search-scripts/get-all-results.php",
        'fetchCountsPath' => HOME_PATH."/basex-search-scripts/get-counts.php",
        'downloadPath' => HOME_PATH."/tmp/$id-gretel-results.txt",
        'resultsLimit' => $resultsLimit,
        'fetchHomePath' => HOME_PATH,
    );
    ?>
    <script>
        var phpVars = <?php echo json_encode($jsVars); ?>;
    </script>
    <script src="js/min/results.min.js"></script>
<?php
}
?>
</body>
</html>
