<?php

$currentPage = 'ebs';
$step = 6;

require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$_SESSION['ebsxps'] = $currentPage;
$id = session_id();
$firstDatabaseExists = true;

$continueConstraints = sessionVariablesSet(array('treebank', 'queryid', 'example', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    $treeVisualizer = true;
    $treebank = $_SESSION['treebank'];
    $components = $_SESSION['subtreebank'];
    $xpath = $_SESSION['xpath'];

    if (is_array($components)) {
        $component = implode(', ', $components);
    } else {
        $component = $components;
        $_SESSION['subtreebank'] = $component;
    }

    $example = $_SESSION['example'];

    $context = $_SESSION['ct'];
    $_SESSION['queryIteration'] = array(0, 0);
    $_SESSION['leftOvers'] = array();
    $_SESSION['already'] = array();

    if ($treebank == 'sonar') $_SESSION['includes'] = array();
}

require "$root/basex-search-scripts/basex-client.php";
require "$root/preparatory-scripts/prep-functions.php";
require "$root/functions.php";
require "$root/front-end-includes/head.php";

if ($continueConstraints) {
  if ($treebank == 'sonar') {
    $bf = xpathToBreadthFirst($xpath);
    if ($bf) {
      $databaseName = $component . $bf;
      $_SESSION['bf'] = $databaseName;
      array_push($_SESSION['includes'], $databaseName);
      $serverInfo = getServerInfo('sonar', $component);

      $dbhost = $serverInfo{'machine'};
      $dbport = $serverInfo{'port'};
      $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

      // db:exists returns a string 'false', still need to convert to bool
      $firstDatabaseExists = $session->query("db:exists('$databaseName')")->execute();

      if ($firstDatabaseExists == 'false') {
        $firstDatabaseExists = false;
        $continueConstraints = false;
      } else {
        $firstDatabaseExists = true;
      }
      $session->close();
    }
    // Do not continue if $bf is empty/not set
    else {
      $continueConstraints = false;
    }
  }
}
session_write_close();
?>

</head>
<?php flush(); ?>
<?php
require "$root/front-end-includes/header.php";

if ($continueConstraints):
  require "$root/front-end-includes/results-shared-content.php";
  setContinueNavigation();
else: // $continueConstraints
  if (!$firstDatabaseExists):
    setErrorHeading('No results found'); ?>
    <p>The query you constructed did not yield any results. Such a structure does not exist in the selected component.</p>
  <?php else:
    setErrorHeading();
    ?>
    <p>You did not select a treebank, or something went wrong when determining the XPath for your request. It is also
        possible that you came to this page directly without first entering an input example.</p>
    <?php
    setPreviousPageMessage(4);
  endif;
endif;
require "$root/front-end-includes/footer.php";
include "$root/front-end-includes/analytics-tracking.php";

if ($continueConstraints) : ?>
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
