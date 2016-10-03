<?php

$currentPage = 'ebs';
$step = 6;

require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$id = session_id();

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

require "$root/functions.php";
require "$root/front-end-includes/head.php";
require "$root/preparatory-scripts/prep-functions.php";

if ($continueConstraints) {
  if ($treebank == 'sonar') {
    $bf = xpathToBreadthFirst($xpath);
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
require "$root/front-end-includes/header.php";

if ($continueConstraints):
?>

  <section id="query-overview">
      <h2>Query overview</h2>
      <div class="flex-content">
      <div>
        <div class="table-wrapper">
          <table>
            <tbody><tr><th>Input example</th><td><em><?php echo $example; ?></em></td></tr>
            <tr><th>XPath</th><td><code style="font-size: 88%"><?php echo $xpath; ?></code></td></tr>
            <tr><th>Treebank</th><td><?php echo strtoupper($treebank)." [$component]"; ?></td></tr>
            </tbody>
          </table>
        </div>
        <a href="front-end-includes/save-xpath.php" class="download-link" title="Download XPath query" target="_blank" download="gretel-xpath.txt">
          <i class="fa fa-fw fa-download" aria-hidden="true"></i> Download XPath</a>
      </div>
        <p>You can save the XPath query to use it as input for the XPath search mode by clicking the button below.
          This allows you to use the same query for another (part of a) treebank or for a slightly modified search without having to start completely
          from scratch.</p>
      </div>
    </section>
  <section id="results">
    <h2>Results overview</h2>
    <div class="content">
      <div class="results-explanation">
          <p>
            After the search is complete, you can download a file that contains the first 500 results that match your query.
            The results are limited to 500. The reason for this is two-fold. For one, it might take very long for a query with
            more than 500 results to finish. More importantly, though, the corpora provided by us are
            <strong>not meant for distribution</strong>. In other words, we do not have the rights to give out the corpus
            as a whole. If a user would search for a structure with only a <code>cat="top"</code> node, they could
            literally download the whole corpus &mdash; which is not the intention of this project.</p>
            <p>
            In the file, each sentence is preceded by the corpus that was used
            (Lassy, CGN, or SoNaR), and the relevant component (e.g. WIKI, NA, WRPEC). At the top of the file you find the XPath code
            that was used to find the results. This can be useful if you want to do a similar query later on. Each sentence also contains
            <code>&lt;hit&gt;</code> tags surrounding the actual structure that you looked for, similar to how the web page shows these
            parts in boldface in the table below.</p>
            <p>Note that due to how the corpora are parsed, some oddities may occur. For instance, punctuation is left out
            in the dependency structure (all punctuation is attached to the topmost node), which means that in a orthographic structure
            the <code>&lt;hit&gt;</code> tags may show <em>punctuation gaps</em>.</p>
        <?php if ($treebank != 'sonar'): ?>
        <p>A distribution overview of the number of hits
          per component is also provided. This overview is not limited to the first 500 hits.
          A distribution list may be useful for data analysis,
          especially if you are interested in comparing different treebank components.
          For example, if you want to know whether a syntactic construction in
          spoken language is more frequent in Netherlandic Dutch or Belgian
          Dutch, you can compare the <em>NL</em> and <em>VL</em> parts of that corpus.
          <strong>Generating the distribution list may take more time than finding the results.</strong>
        </p>
        <?php endif; ?>
      </div>
      <div class="results-download-wrapper">
        <div class="results-messages-wrapper">
          <h3>Download results</h3>
          <div class="messages">
          </div>
        </div>
        <?php if ($treebank != 'sonar'): ?>
        <div class="distribution-wrapper">
        <h3>Distribution list</h3>
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
        <a href='<?php echo "tmp/$id-gretel-distribution.csv"; ?>' class="download-link"
          title="Download distribution" target="_blank" download="gretel-distribution.csv">
          <i class="fa fa-fw fa-download" aria-hidden="true"></i> Download distribution</a>
      </div>
    <?php endif; ?>
    </div>
    </div>
    <div class="results-ajax-wrapper">
      <h2>All results</h2>
      <p><strong>Click on a sentence ID</strong> to view the tree structure. The
        sentence ID refers to the treebank component in which the sentence occurs,
        the text number, and the location within the text
        (<em>p</em> page numbers, <em>s</em> sentence number).
      </p>
      <?php include "$root/front-end-includes/results-controls.php"; ?>
      <?php require "$root/front-end-includes/results-table-wrapper.php"; ?>
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
    setPreviousPageMessage(4);

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
