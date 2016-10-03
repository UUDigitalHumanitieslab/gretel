<?php

$currentPage = 'ebs';
$step = 5;

require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

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

if (!$noTbFlag) {
    if (isset($_POST['subtreebank'])) {
        $component = $_POST['subtreebank'];
        $_SESSION['subtreebank'] = $component;
    } elseif (isset($_SESSION['subtreebank'])) {
        $component = $_SESSION['subtreebank'];
    } else {
        $noTbFlag = 1;
    }
}

$continueConstraints = !$noTbFlag && sessionVariablesSet(array('sentence', 'treebank', 'subtreebank', 'xpath', 'manualMode'));

if ($continueConstraints) {
    $id = session_id();
    $queryId = $_SESSION['queryid'];
    $treeVisualizer = true;

    $tokinput = $_SESSION['sentence'];
    $manualMode = $_SESSION['manualMode'];

    $xpath = $_SESSION['xpath'];
    $xpChanged = $_SESSION['xpChanged'];

    $_SESSION['ct'] = isset($_POST['ct']) ? true : false;
}

session_write_close();

require "$root/functions.php";
require "$root/front-end-includes/head.php";
?>

<link rel="prefetch" href="js/min/results.min.js">
</head>
<?php flush(); ?>
<?php require "$root/front-end-includes/header.php"; ?>
<?php if ($continueConstraints) :
  $component = implode(', ', $component);
  $xpath = rtrim($xpath);

  // Log query tree
  $qTree = file_get_contents("$tmp/$id-sub.xml");
  $treeLog = fopen("$log/gretel-querytrees.log", 'a');
  fwrite($treeLog, "<alpino_ds id=\"$queryId\">$qTree\n</alpino_ds>\n");
  fclose($treeLog);
?>

<h3>Input</h3>
<ul>
<li>Input example: <em><?php echo $tokinput; ?></em></li>
<li>Treebank: <?php echo strtoupper($treebank); ?></li>
<li>Components: <?php echo strtoupper($component); ?></li>
</ul>

<?php if (!$xpChanged): ?>
  <h3>Query tree</h3>
<div id="tree-output"></div>
<?php endif; ?>

  <h3>XPath expression<?php if (!$xpChanged): ?>, generated from the query tree<?php endif; ?></h3>
  <div class="generated-xpath"><code><?php echo $xpath; ?></code></div>
    <form action="ebs/results.php" method="post">
    <?php setContinueNavigation(); ?>
    </form>
<?php else: // $continueConstraints
    setErrorHeading();
?>
    <p>You did not select a treebank, or something went wrong when determining the XPath for your request. It is also
    possible that you came to this page directly without first entering an input example.</p>

<?php
    setPreviousPageMessage(4);
endif;  // $continueConstraints
require "$root/front-end-includes/footer.php";
include "$root/front-end-includes/analytics-tracking.php";

if ($continueConstraints && !$xpChanged) : ?>
    <script src="js/tree-visualizer.js"></script>
    <script>
    $(function(){
      $("#tree-output").treeVisualizer('<?php echo "tmp/$id-sub.xml" ?>', {extendedPOS: true});
    });
    </script>
<?php endif; ?>
</body>
</html>
