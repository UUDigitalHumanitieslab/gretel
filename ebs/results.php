<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require '../config/config.php';
require "$root/helpers.php";

session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'ebs';
$step = 6;

$id = session_id();

$continueConstraints = sessionVariablesSet(array('treebank', 'search', 'sentid', 'example', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    $sortTables = true;
    $treeVisualizer = true;
    $treebank = $_SESSION['treebank'];
    $components = $_SESSION['subtreebank'];

    if (is_array($components)) {
        $component = implode(', ', $components);
    } else {
        $component = $components;
        $_SESSION['subtreebank'] = $component;
    }

    $sm = $_SESSION['search'];
    $example = $_SESSION['example'];

    if (isset($_POST['xp'])) {
        $xpath = $_POST['xp'];
    } else {
        $xpath = $_SESSION['xpath'];
    }

    // Clean up XPath
    $xpath = rtrim($xpath);
    $xpath = str_replace(array("\r", "\n", "\t"), ' ', $xpath);
    // Deal with quotes/apos
    $trans = array("='" => '="', "'\s" => '"\s', "']" => '"]');
    $xpath = strtr("$xpath", $trans);

    if ($treebank == 'sonar') $xpath = preg_replace('/^\/{0,2}node/', '/node', $xpath);
    else $xpath = preg_replace('/^\/{0,2}node/', '//node', $xpath);

    $_SESSION['xpath'] = $xpath;

    if ($sm == 'advanced' && $treebank != 'sonar') {
        $originalXp = $_POST['originalXp'];
      // Clean up $originalXp
      $originalXp = rtrim($originalXp);
        $originalXp = str_replace(array("\r", "\n", "\t"), ' ', $originalXp);
        $originalXp = strtr($originalXp, $trans);

        if ($treebank == 'sonar') $originalXp = preg_replace('/^\/{0,2}node/', '/node', $originalXp);
        else $originalXp = preg_replace('/^\/{0,2}node/', '//node', $originalXp);

        $xpChanged = ($xpath == $originalXp) ? 'no' : 'yes';

        $_SESSION['originalXp'] = $originalXp;
        $_SESSION['xpChanged'] = $xpChanged;
    }

    // get context option
    $context = ($_SESSION['ct'] == 'on') ? 1 : 0;

    $_SESSION['queryIteration'] = array(0, 0);
    $_SESSION['leftOvers'] = array();
    $_SESSION['already'] = array();
    if ($treebank == 'sonar') $_SESSION['includes'] = array();

    $lpxml = simplexml_load_file("$tmp/$id-pt.xml");

    $export = "$home/scripts/SaveResults.php?"; // script for downloading the results
    $exportxp = "$home/scripts/SaveXPath.php"; // script for downloading the XPath expression
}

require "$root/functions.php";
require "$root/php/head.php";
?>

</head>
<?php flush(); ?>
<?php
require "$root/php/header.php";

if ($continueConstraints):
    if ($treebank == 'sonar') {
        $bf = xpath2Bf($xpath);
        $_SESSION['bf'] = $component . $bf;
        array_push($_SESSION['includes'], $_SESSION['bf']);
    }
  ?>
  <section>
  <div><a href="<?php echo $export.'print=txt'; ?>" title="Printer-friendly version of all results"
    download="gretel-results.txt">Download results</a></div>
  <?php if ($treebank == 'lassy' || $treebank == 'cgn'): ?>
    <h3>Results</h3>
    <p>It is possible to dowload a tab-separated file of sentence IDs, matching sentences, and hits per sentence from the table below.
      You can also see and download a distribution overview of the hits over the different treebanks.</p>
      <!--
    <table><tbody>
      <tr><th>Hits</th><td>'.$TOTALCOUNTS['hits'].'</td></tr>
      <tr><th>Matching sentences</th><td>'.$TOTALCOUNTS['ms'].'</td>
      <tr><th>Sentences in treebank</th><td>'.$TOTALCOUNTS['totals'].'</td></tr>
    </tbody></table>
  -->
    <a href="#restable" class="show_hide" id="restable">
      <div id="show" class="showhide">Show hits distribution</div><div id="hide" class="showhide">Hide hits distribution</div>
    </a>
    <div class="slidingDiv">
      <?php // printCounts($treebank, $HITS, $MS, $TOTALS, $TOTALCOUNTS); ?>
      <p class="temporary">Still counting</p>
      <a href="<?php echo $export.'&print=csv'; ?>" title="Comma-separated file of detailed search results' (counts per treebank)"
        download="gretel-distribution.txt">Download distribution</a>
    </div>
    <p><strong>Click on a sentence ID</strong> to view the tree structure. The sentence ID refers to the treebank component in which
      the sentence occurs, the text number, and the location within the text (page + sentence number).</p>

    <?php endif; // $treebank lassy and cgn ?>
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
<section>
    <h3>Query</h3>
    <p>You can <a href="<?php echo $exportxp; ?>" title="Save XPath query" download="gretel-xpath.txt">save the XPath query</a>
        to use it as input for the XPath search mode.
        This allows you to use the same query for another (part of a) treebank or for a slightly modified search without having to start completely
        from scratch.</p>
      <div class="table-wrapper">
        <table>
          <tbody><tr><th>Input example</th><td><?php echo $example; ?></td></tr>
          <tr><th>XPath</th><td><code><?php echo $xpath; ?></code></td></tr>
          <?php if ($treebank == 'lassy' || $treebank == 'cgn'): ?>
          <tr><th>Treebank</th><td><?php echo strtoupper($treebank)." [$component]"; ?></td></tr>
          <?php elseif ($treebank == 'sonar'): ?>
          <tr><th>Treebank</th><td><?php echo strtoupper($treebank)." [$component]"; ?></td></tr>
          <?php endif; ?>
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
