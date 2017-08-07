<?php
session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$currentPage = 'ebs';
$step = 7;

require "../config.php";
require ROOT_PATH . "/helpers.php";

require ROOT_PATH . "/front-end-includes/metadata.php";
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

    session_write_close();
}
?>
<?php flush(); ?>
<?php
require ROOT_PATH . "/front-end-includes/header.php";

if ($continueConstraints) {
    ?>
    <analysis data-api-url="<?=htmlspecialchars(API_URL) ?>" data-corpus="<?=htmlspecialchars($corpus) ?>"></analysis>
    <?php
    setContinueNavigation();
} else {
    ?>
    <p>Something went wrong. It is possible that you came to this page directly without entering the required fields in the previous steps.</p>
    <?php
}
require ROOT_PATH . "/front-end-includes/footer.php";
include ROOT_PATH . "/front-end-includes/analytics-tracking.php";
?>
<link rel="stylesheet" href="js/packages/pivottable/pivot.min.css">
<div id="xpath-variables">
<?php
if (isset($_POST["xpath-variables"])) {
    $variables = $_POST["xpath-variables"];
    foreach ($variables as $index => $value) {
        $name = htmlspecialchars($value['name']);
        $path = htmlspecialchars($value['path']);
        ?><span class="path-variable" data-name="<?= $name ?>" data-path="<?= $path ?>"></span><?php
    }
}
?>
</div>
</body>
</html>
