<?php
session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'xps';
$step = 3;

require '../config/config.php';
require "$root/helpers.php";

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
    require "$root/preparatory-scripts/prep-functions.php";
    $treeVisualizer = true;
    $onlyFullscreenTv = true;

    $xpath = $_SESSION['xpath'];
    // Need to clean in case the user goes back in history, otherwise the
    // prepended slashes below would keep stacking on each back-and-forward
    // in history
    $xpath = cleanXpath($xpath);

    // get context option
    $_SESSION['ct'] = isset($_POST['ct']) ? true : false;

    $_SESSION['endPosIteration'] = 0;
    $_SESSION['startDatabases'] = array();

    if ($corpus == 'sonar') {
        $_SESSION['flushAlready'] = array();
        $databaseExists = false;
    }

    $needRegularSonar = false;
}

session_write_close();

require "$root/functions.php";
require "$root/front-end-includes/head.php";

if ($continueConstraints) {
  require "$root/basex-search-scripts/treebank-search.php";
  require "$root/basex-search-scripts/basex-client.php";
  session_start();
  if ($corpus == 'sonar') {
    $bf = xpathToBreadthFirst($xpath);
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

  // When flushing we update the databases on each iteration, not so in counting
  // or when fetching all results
  $_SESSION['flushDatabases'] = $_SESSION['startDatabases'];
  $_SESSION['xpath'] = $xpath;
  $_SESSION['needRegularSonar'] = $needRegularSonar;
  session_write_close();
}
?>
</head>
<?php flush(); ?>
<?php
require "$root/front-end-includes/header.php";

if ($continueConstraints):
    require "$root/front-end-includes/results-shared-content.php";
    setContinueNavigation();
else: // $continueConstraints
    setErrorHeading();
    ?>
    <p>You did not select a treebank, or something went wrong when determining the XPath for your request. It is also
        possible that you came to this page directly without first entering an input example.</p>
    <?php
    setPreviousPageMessage(2);

endif;
require "$root/front-end-includes/footer.php";
include "$root/front-end-includes/analytics-tracking.php";

if ($continueConstraints):
  ?>
    <div class="loading-wrapper fullscreen tv">
        <div class="loading"><p>Loading tree...<br>Please wait</p></div>
    </div>
    <?php include "$root/front-end-includes/notifications.php"; ?>
    <?php // Variables for JS
    $jsVars = array(
        'fetchResultsPath' => "$home/basex-search-scripts/flush-results.php",
        'getAllResultsPath' => "$home/basex-search-scripts/get-all-results.php",
        'fetchCountsPath' => "$home/basex-search-scripts/get-counts.php",
        'downloadPath' => "$home/tmp/$id-gretel-results.txt",
        'resultsLimit' => $resultsLimit,
        'fetchHomePath' => $home,
    );
    ?>
    <script>
        var phpVars = <?php echo json_encode($jsVars); ?>;
    </script>
    <script src="js/results.js"></script>
<?php endif; ?>
</body>
</html>
