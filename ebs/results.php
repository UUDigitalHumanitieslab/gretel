<?php
session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'ebs';
$step = 6;

require '../config/config.php';
require "$root/helpers.php";

$_SESSION['ebsxps'] = $currentPage;
$id = session_id();

$continueConstraints = sessionVariablesSet(array('treebank', 'queryid', 'example', 'subtreebank', 'xpath'));

if ($continueConstraints) {
  require "$root/preparatory-scripts/prep-functions.php";

    $treeVisualizer = true;
    $treebank = $_SESSION['treebank'];
    $components = $_SESSION['subtreebank'];
    $xpath = $_SESSION['xpath'];
    $originalXp = $_SESSION['originalXp'];

    // Need to clean in case the user goes back in history, otherwise the
    // prepended slashes below would keep stacking on each back-and-forward
    // in history
    $xpath = cleanXpath($xpath);
    $originalXp = cleanXpath($originalXp);

    if (is_array($components)) {
        $component = implode(', ', $components);
    } else {
        $component = $components;
        $_SESSION['subtreebank'] = $component;
    }

    $example = $_SESSION['example'];

    $context = $_SESSION['ct'];
    $_SESSION['endPosIteration'] = 0;
    $_SESSION['leftOvers'] = array();

    if ($treebank == 'sonar') {
      $_SESSION['includes'] = array();
      $_SESSION['already'] = array();
      $needRegularSonar = false;
      $databaseExists = false;
      $includes = array();
    }
}

session_write_close();

require "$root/functions.php";
require "$root/front-end-includes/head.php";

if ($continueConstraints) {
  require "$root/basex-search-scripts/treebank-search.php";
  require "$root/basex-search-scripts/basex-client.php";

  if ($treebank == 'sonar') {
    $bf = xpathToBreadthFirst($xpath);
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
  }

  session_start();
  $_SESSION['xpath'] = $xpath;
  $_SESSION['originalXp'] = $originalXp;
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
  if (isset($databaseExists) && !$databaseExists):
    setErrorHeading('No results found'); ?>
    <p>The query you constructed did not yield any results. Such a structure does not exist in the selected component.</p>
  <?php else:
    setErrorHeading();
    ?>
    <p>Something went wrong. It is possible that you came to this page directly without entering the required fields in the previous steps.</p>
    <?php
    setPreviousPageMessage(4);
  endif;
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
