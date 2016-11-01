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

$continueConstraints = sessionVariablesSet(array('treebank', 'queryid', 'example', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    $treeVisualizer = true;
    $databaseExists = false;
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
    $_SESSION['endPosIteration'] = 0;
    $_SESSION['leftOvers'] = array();

    if ($treebank == 'sonar') {
      $_SESSION['includes'] = array();
      $_SESSION['already'] = array();
      $needRegularSonar = false;
      $includes = array();
    }
}

require "$root/basex-search-scripts/basex-client.php";
require "$root/preparatory-scripts/prep-functions.php";
require "$root/basex-search-scripts/treebank-search.php";
require "$root/functions.php";
require "$root/front-end-includes/head.php";

if ($continueConstraints) {
  if ($treebank == 'sonar') {
    $bf = xpathToBreadthFirst($xpath);
    if ($bf && $bf != 'ALL') {
        // If is substring (eg. ALLnp%det)
        if (strpos($bf, 'ALL') !== false) {
            foreach ($cats as $cat) {
              $bfcopy = $component . str_replace('ALL', $cat, $bf);
              $includes[] = $bfcopy;
            }
        } else {
          $includes[] = $component . $bf;
        }

        $serverInfo = getServerInfo('sonar', $component);

        $dbhost = $serverInfo{'machine'};
        $dbport = $serverInfo{'port'};
        $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

        foreach ($includes as $include) {
          // db:exists returns a string 'false', still need to convert to bool
          $databaseExists = $session->query("db:exists('$include')")->execute();

          if ($databaseExists != 'false') {
            $databaseExists = true;
            $_SESSION['includes'][] = $include;
          }
        }

        $continueConstraints = $databaseExists ? true : false;
        $session->close();
    } else {
      $_SESSION['includes'] = getRegularSonar($component);
      $needRegularSonar = true;
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
  if (isset($firstDatabaseExists) && !$firstDatabaseExists):
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

if ($continueConstraints) :
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
