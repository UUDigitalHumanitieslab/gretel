<?php
require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = $_SESSION['ebsxps'];
$step = 5;

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

$continueConstraints = !$noTbFlag && sessionVariablesSet(array('sentence', 'treebank', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    $id = session_id();
    $queryId = $_SESSION['queryid'];
    $treeVisualizer = true;

    $tokinput = $_SESSION['sentence'];

    $xpath = $_SESSION['xpath'];

    $_SESSION['ct'] = isset($_POST['ct']) ? true : false;
}

session_write_close();

require "$root/functions.php";
require "$php/head.php";
?>
</head>
<?php flush(); ?>
<?php require "$php/header.php"; ?>

<?php if ($continueConstraints) :
    $component = implode(', ', $component);
  $xpath = rtrim($xpath);

    //log query tree
  $qtree = file_get_contents("$tmp/$id-sub.xml");
  $tlog = fopen("$log/gretel-querytrees.log", 'a');  //concatenate
  fwrite($tlog, "<alpino_ds id=\"$queryId\">$qtree\n</alpino_ds>\n");
  fclose($tlog);
?>

<ul>
<li>Input example: <em><?php echo $tokinput; ?></em></li>
<li>Treebank: <?php echo strtoupper($treebank); ?></li>
<li>Components: <?php echo strtoupper($component); ?></li>
</ul>

<div id="tree-output"></div>

<?php
    if ($treebank == 'sonar') : ?>
      <p>XPath expression, generated from the query tree. It is not possible to use custom XPath when querying SONAR; the code
        below is provided to show you the structure that is assigned to your input example.</p>

    <?php else : ?>
      <p>XPath expression, generated from the query tree. You can adapt it if necessary. Only do so if you know what you are doing!
      If you are dealing with a long query, the
      <a href="http://bramvanroy.be/projects/xpath-beautifier" target="_blank" title="XPath beautifier">XPath beautifier</a> might come in handy.</p>
    <?php endif; ?>

    <form action="ebs/results.php" method="post">
    <?php
    if ($treebank == 'sonar') {
        $readonly = 'readonly';
    } else {
        $readonly = '';
        $htmlXpath = htmlentities($xpath, ENT_QUOTES);
        echo '<input type="hidden" name="originalXp" value="'.$htmlXpath.'">';
    }
    ?>
    <textarea name="xp" wrap="soft" <?php echo $readonly;?>><?php echo $xpath; ?></textarea>

    <?php if ($treebank != 'sonar') : ?><input type="reset" value="Reset XPath"><?php endif; ?>
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
require "$php/footer.php";
include "$root/scripts/AnalyticsTracking.php";

if ($continueConstraints) : ?>
    <script src="js/tree-visualizer.js"></script>
    <script>
    $(document).ready(function() {
      $("#tree-output").treeVisualizer('<?php echo "tmp/$id-sub.xml" ?>', {extendedPOS: true});
    });
    </script>
<?php endif; ?>
</body>
</html>
