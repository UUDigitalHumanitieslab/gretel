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

$continueConstraints = isset($_POST['sid']) && sessionVariablesSet($_POST['sid'], array('treebank', 'queryid', 'example', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    require ROOT_PATH . "/preparatory-scripts/prep-functions.php";

    define('SID', $_POST['sid']);
    $_SESSION[SID]['ebsxps'] = $currentPage;
    $treeVisualizer = true;
    $onlyFullscreenTv = true;
    $corpus = $_SESSION[SID]['treebank'];
    $components = $_SESSION[SID]['subtreebank'];
    $xpath = $_SESSION[SID]['xpath'];
    $_SESSION[SID]['metadataFilter'] = get_metadata_filter(SID);
    $originalXp = $_SESSION[SID]['originalXp'];

  // Need to clean in case the user goes back in history, otherwise the
  // prepended slashes below would keep stacking on each back-and-forward
  // in history
    $xpath = cleanXpath($xpath);
    $originalXp = cleanXpath($originalXp);
    $example = $_SESSION[SID]['example'];

    $context = $_SESSION[SID]['ct'];
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
         // $_SESSION[SID]['startDatabases']
        checkBfPattern($bf, SID);

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
        $_SESSION[SID]['startDatabases'] = corpusToDatabase($components, $corpus);
    }

  // When flushing we update the databases on each iteration, not so in counting
  // or when fetching all results
    $_SESSION[SID]['flushAlready'] = $_SESSION[SID]['flushDatabases'] = $_SESSION[SID]['startDatabases'];
    $_SESSION[SID]['xpath'] = $xpath;
    $_SESSION[SID]['originalXp'] = $originalXp;
    $_SESSION[SID]['needRegularSonar'] = $needRegularSonar;
}

session_write_close();
?>
</head>
<?php
flush();

require ROOT_PATH . "/front-end-includes/header.php";

if ($continueConstraints) {
    require ROOT_PATH."/front-end-includes/results-shared-content.php";
    ?>    
    <form action="ebs/analysis.php" method="post">
        <input type="hidden" name="sid" value="<?php echo SID; ?>">
        <?php
        setContinueNavigation();
        render_xpath_variables_hidden("xpath-variables");
        ?>
    </form>
    <?php
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
        'fetchResultsPath' => HOME_PATH."/basex-search-scripts/flush-results.php?sid=".SID,
        'getAllResultsPath' => HOME_PATH."/basex-search-scripts/get-all-results.php?sid=".SID,
        'fetchCountsPath' => HOME_PATH."/basex-search-scripts/get-counts.php?sid=".SID,
        'downloadPath' => HOME_PATH."/tmp/".SID."-gretel-results.txt",
        'printPath' => HOME_PATH."/tmp/".SID."-gretel-results-print.html",
        'resultsLimit' => $resultsLimit,
        'fetchHomePath' => HOME_PATH,
        'sid' => SID,
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
