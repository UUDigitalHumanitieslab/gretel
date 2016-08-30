<?php

require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = $_SESSION['ebsxps'];
$step = 6;

$id = session_id();

$continueConstraints = sessionVariablesSet(array('treebank', 'search', 'queryid', 'example', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    $treeVisualizer = true;
    $treebank = $_SESSION['treebank'];
    $components = $_SESSION['subtreebank'];

    if (is_array($components)) {
        $component = implode(', ', $components);
    } else {
        $component = $components;
        $_SESSION['subtreebank'] = $component;
    }

    $searchMode = $_SESSION['search'];
    $example = $_SESSION['example'];

    if (isset($_POST['xp'])) {
        $xpath = $_POST['xp'];
    } else {
        $xpath = $_SESSION['xpath'];
    }

    // Clean up XPath
    $xpath = html_entity_decode($xpath, ENT_QUOTES);
    $xpath = rtrim($xpath);
    $xpath = str_replace(array("\r", "\n", "\t"), ' ', $xpath);
    // Deal with quotes/apos
    $trans = array("='" => '="', "' " => '" ', "']" => '"]');
    $xpath = strtr("$xpath", $trans);

    if ($treebank == 'sonar') $xpath = preg_replace('/^\/*node/', '/node', $xpath);
    else $xpath = preg_replace('/^\/*node/', '//node', $xpath);

    $_SESSION['xpath'] = $xpath;

    if ($searchMode == 'advanced' && $treebank != 'sonar') {
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

    $context = $_SESSION['ct'];
    $_SESSION['queryIteration'] = array(0, 0);
    $_SESSION['leftOvers'] = array();
    $_SESSION['already'] = array();

    if ($treebank == 'sonar') $_SESSION['includes'] = array();
}

require "$root/functions.php";
require "$php/head.php";

if ($continueConstraints) {
  if ($treebank == 'sonar') {
    $bf = xpath2Bf($xpath);
    if (!empty($bf)) {
      $_SESSION['bf'] = $component . $bf;
      array_push($_SESSION['includes'], $_SESSION['bf']);
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
require "$php/header.php";

if ($continueConstraints):
?>

  <section>
      <h3>Query overview</h3>
      <p>You can save the XPath query to use it as input for the XPath search mode by clicking the button below.
          This allows you to use the same query for another (part of a) treebank or for a slightly modified search without having to start completely
          from scratch.</p>
        <div class="table-wrapper">
          <table>
            <tbody><tr><th>Input example</th><td><em><?php echo $example; ?></em></td></tr>
            <tr><th>XPath</th><td><code><?php echo $xpath; ?></code></td></tr>
            <?php if ($treebank == 'sonar'): ?>
            <tr><th>Treebank</th><td><?php echo strtoupper($treebank)." [$component]"; ?></td></tr>
            <?php else: ?>
            <tr><th>Treebank</th><td><?php echo strtoupper($treebank)." [$component]"; ?></td></tr>
            <?php endif; ?>
            </tbody>
          </table>
        </div>
        <a href='<?php echo "$home/scripts/SaveXPath.php"; ?>' class="download-link" title="Save XPath query" target="_blank" download="gretel-xpath.txt"><i class="fa fa-fw fa-arrow-down"></i> Save XPath</a>
    </section>
  <section id="results-section">
    <h3>Results</h3>
    <?php if ($treebank != 'sonar'): ?>
      <article class="distribution-wrapper" style="display: none">
        <p>The table below presents a distribution overview of the number of hits
          per component, also showing the complete amount of sentences that were
          looked through. This may be useful for data analysis, especially if you
          are interested in comparing different treebank components.
        </p>
        <p>For example, if you want to know whether a syntactic construction in
          spoken language is more frequent in Netherlandic Dutch or Belgian
          Dutch, you can compare the <em>NL</em> and <em>VL</em> parts of that corpus.
        </p>
        <p>You can download a comma-separated distribution overview from the download
          link below.
        </p>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                  <th>Treebank</th>
                  <th>Hits</th>
                  <th># sentences in treebank</th>
              </tr>
            </thead>
            <tbody>
            </tbody>
          </table>
        </div>
        <a href='<?php echo "$home/tmp/${id}gretel-distribution.csv"; ?>' class="download-link" title="Save distribution" target="_blank" download="gretel-distribution.csv"><i class="fa fa-fw fa-arrow-down"></i> Save distribution</a>
      </article>
    <?php endif; ?>
    <article class="results-wrapper">
      <aside class="messages">
      </aside>

      <p><strong>Click on a sentence ID</strong> to view the tree structure. The
        sentence ID refers to the treebank component in which the sentence occurs,
        the text number, and the location within the text
        (<em>p</em> page numbers, <em>s</em> sentence number).
      </p>
      <?php include "$php/results-controls.php"; ?>
      <?php require "$php/results-table-wrapper.php"; ?>
    </article>
</section>
<?php
    setContinueNavigation();
else: // $continueConstraints
    setErrorHeading();
    ?>
    <p>You did not select a treebank, or something went wrong when determining the XPath for your request. It is also
        possible that you came to this page directly without first entering an input example.</p>
    <?php
    setPreviousPageMessage(4);

endif;
require "$php/footer.php";
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
