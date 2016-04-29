<?php
require '../config/config.php';
require "$root/helpers.php";

error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'ebs';
$step = 5;
$noTbFlag = 0;

$id = session_id();
$time = time();

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
    $component = $_POST['subtreebank'];
    $_SESSION['subtreebank'] = $component;
} elseif (isset($_SESSION['subtreebank'])) {
    $component = $_SESSION['subtreebank'];
} else {
    $noTbFlag = 1;
}

$continueConstraints = !$noTbFlag && sessionVariablesSet(array('sentence', 'search', 'treebank', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    $treeVisualizer = true;

    $tokinput = $_SESSION['sentence'];

    $sm = $_SESSION['search'];
    $xpath = $_SESSION['xpath'];

    if (isset($_POST['ct'])) {
        $_SESSION['ct'] = 'on';
    } else {
        $_SESSION['ct'] = 'off';
    }
}

require "$root/functions.php";
require "$root/php/head.php";
?>
</head>
<?php flush(); ?>
<?php require "$root/php/header.php"; ?>

<?php if ($continueConstraints) :
    $component = implode(', ', $component);
  $xpath = rtrim($xpath);

    //log query tree
  $qtree = file_get_contents("$tmp/$id-sub.xml");
  $tlog = fopen("$log/gretel-querytrees.log", "a");  //concatenate
  fwrite($tlog, "<alpino_ds id=\"$id-$time\">$qtree\n</alpino_ds>\n");
  fclose($tlog);
?>

<ul>
<li>Input example: <em><?php echo $tokinput; ?></em></li>
<li>Treebank: <?php echo strtoupper($treebank); ?></li>
<li>Components: <?php echo strtoupper($component); ?></li>
</ul>

<div id="tree-output"></div>

<?php
  if ($sm == 'advanced') :
    if ($treebank == 'sonar') : ?>
      <p>XPath expression, generated from the query tree.</p>

    <?php else : ?>
      <p>XPath expression </b>generated from the query tree. You can adapt it if necessary.
      If you are dealing with a long query, the
      <a href="http://bramvanroy.be/projects/xpath-beautifier" target="_blank">XPath beautifier</a> might come in handy.</p>
    <?php endif; ?>

    <form action="results.php" method="post">
    <?php
    if ($treebank == 'sonar') {
        $readonly = 'readonly';
    }
    else {
        $readonly = '';
        echo '<input type="hidden" name="original-xp" value="'.$xpath.'">';
    }
    ?>
    <textarea name="xp" wrap="soft" <?php echo $readonly;?>><?php echo $xpath; ?></textarea>

    <input type="reset" value="Reset XPath">
  <?php else : // $sm == 'advcaned' ?>
    <form action="results.php" method="post">
  <?php endif; // $sm == 'advcaned' ?>

    <?php setContinueNavigation(); ?>
  </form>
<?php else: // $continueConstraints
    setErrorHeading();
?>
    <p>You did not select a treebank, or something went wrong when determining the XPath for your request. It is also
    possible that you came to this page directly without first entering an input example.</p>

<?php
    getPreviousPageMessage(4);
endif;  // $continueConstraints
require "$root/php/footer.php";
include "$root/scripts/AnalyticsTracking.php";

if ($continueConstraints) : ?>
    <script src="<?php echo $home; ?>/js/tree-visualizer.js"></script>
    <script>
    $(document).ready(function() {
        <?php if ($sm == 'advanced'): ?>
            $("#tree-output").treeVisualizer('<?php echo "$home/tmp/$id-sub.xml?$id-$time" ?>', {extendedPOS: true});
        <?php else: ?>
            $("#tree-output").treeVisualizer('<?php echo "$home/tmp/$id-sub.xml?$id-$time" ?>');
        <?php endif; ?>
      });
    </script>
<?php endif; ?>
</body>
</html>
