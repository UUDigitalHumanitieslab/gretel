<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'xps';
$step = 3;

$id = session_id();
$noTbFlag = 0;

if (isset($_POST['treebank'])) {
    $treebank = $_POST['treebank'];
    $_SESSION['treebank'] = $treebank;
} elseif (isset($_SESSION['treebank'])) {
    $treebank = $_SESSION['treebank'];
} else {
    $noTbFlag = 1;
    $treebank = '';
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
    $treeVisualizer = true;

    $xpath = $_SESSION['xpath'];

    if (is_array($components)) {
        $componentsString = implode(', ', $components);
    } else {
        $componentsString = $components;
        $_SESSION['subtreebank'] = $componentsString;
    }

    // get context option
    $context = ($_SESSION['ct'] == 'on') ? 1 : 0;

    $_SESSION['queryIteration'] = array(0, 0);
    $_SESSION['leftOvers'] = array();
    $_SESSION['already'] = array();
}

require "$root/functions.php";
require "$root/php/head.php";
?>

</head>
<?php flush(); ?>
<?php
require "$root/php/header.php";

if ($continueConstraints):
  ?>

  <section>
      <h2>Query overview</h2>
      <p>You can <a href='<?php echo "$home/scripts/SaveXPath.php"; ?>' title="Save XPath query" target="_blank" download="gretel-xpath.txt">save the XPath query</a>
          to use it as input for the XPath search mode.
          This allows you to use the same query for another (part of a) treebank or for a slightly modified search without having to start completely
          from scratch.</p>
        <div class="table-wrapper">
          <table>
            <tbody><tr><th>Input example</th><td><em><?php echo $example; ?></em></td></tr>
            <tr><th>XPath</th><td><code><?php echo $xpath; ?></code></td></tr>
            <tr><th>Treebank</th><td><?php echo strtoupper($treebank)." [$componentsString]"; ?></td></tr>
            </tbody>
          </table>
        </div>
    </section>
  <section>
    <h2>Results</h2>
    <p>It is possible to dowload a tab-separated file of sentence IDs, matching sentences, and hits per sentence from the table below.
      You can also see and download a distribution overview of the hits over the different treebanks.</p>

    <p><strong>Click on a sentence ID</strong> to view the tree structure. The sentence ID refers to the treebank component in which
      the sentence occurs, the text number, and the location within the text (page + sentence number).</p>
    <aside class="messages">
      <div class="error">
        <p></p>
      </div>

      <div class="notice">
        <p></p>
      </div>
    </aside>
    <div class="dummy-controls" hidden>
        <div class="content">
        </div>
    </div>
    <nav class="controls">
        <p class="count"># of results: <span><strong>0</strong> / <span>--</span><span></p>
        <form><label for="go-to" class="disabled">Go to # <input type="text" id="go-to" name="go-to" pattern="[0-9]+" value="1" disabled></label></form>
        <label for="filter-components" class="disabled"><input type="checkbox" id="filter-components" name="filter-components" hidden disabled>Filter components <i class="fa fa-angle-down" aria-hidden="true"></i></label>
        <div class="filter-wrapper">
            <label class="disabled active" for="all-components"><i class="fa fa-check" aria-hidden="true"></i><input type="checkbox" id="all-components" name="all-components" checked disabled hidden>All</label>
            <?php foreach ($components as $comp) {
                echo '<label class="disabled"><input type="checkbox" name="component" value="'.strtoupper($comp).'" checked disabled> '.strtoupper($comp).'</label>';
            } ?>
        </div>
        <div class="loading-wrapper searching active">
            <div class="loading"></div>
        </div>
        <button class="stop">Stop searching</button>
        <button class="continue" disabled>Continue searching</button>
        <button name="to-top"><i class="fa fa-arrow-up"></i></button>
    </nav>
    <div class="results-wrapper table-wrapper" style="display: none">
      <table>
        <thead>
          <tr>
              <th>#</th>
              <th>ID</th>
              <th>Component</th>
              <th>Sentence</th>
          </tr>
        </thead>
        <tbody>
        </tbody>
        <tbody class="empty">
            <tr><td colspan="4">No results for the filters you specified.</td></tr>
        </tbody>
      </table>
    </div>
</section>
<?php
    setContinueNavigation();
else: // $continueConstraints
    setErrorHeading();
    ?>
    <p>You did not select a treebank, or something went wrong when determining the XPath for your request. It is also
        possible that you came to this page directly without first entering an input example.</p>
    <?php
    getPreviousPageMessage(4);

endif;
session_write_close();
require "$root/php/footer.php";
include "$root/scripts/AnalyticsTracking.php";

if ($continueConstraints) : ?>
    <div class="loading-wrapper fullscreen tv">
        <div class="loading"><p>Loading tree...<br>Please wait</p></div>
    </div>
    <?php // Variables for JS
    $jsVars = array(
        'fetchResultsPath' => "$home/php/flush-results.php",
        'getAllResultsPath' => "$home/php/get-all-results.php",
        'fetchCountsPath' => "$home/php/fetch-counts.php",
        'downloadPath' => "$home/tmp/${id}gretel-results.txt",
        'resultsLimit' => $resultsLimit,
        'fetchHomePath' => $home,
    );
    ?>
    <script>
        var phpVars = <?php echo json_encode($jsVars); ?>;
    </script>
    <script src='<?php echo "$home/js/results.js"; ?>'></script>
<?php endif; ?>
</body>
</html>
