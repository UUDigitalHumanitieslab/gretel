<?php

require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = $_SESSION['ebsxps'];
$step = 2;

$continueConstraints = isset($_POST['xpath']) || isset($_SESSION['xpath']);
$id = session_id();

if ($continueConstraints) {
    $xpath = (isset($_POST['xpath'])) ? $_POST['xpath'] : $_SESSION['xpath'];
}

require "$root/functions.php";
require "$php/head.php";

// Check if $xpath contains email addresses or website URLs
$isSpam = ($continueConstraints) ? isSpam($xpath) : false;

?>
</head>
<?php flush(); ?>
<?php
require "$php/header.php";

if ($continueConstraints && !$isSpam) {
    // Clean up XPath
    $xpath = rtrim($xpath);
    $xpath = str_replace(array("\r", "\n", "\t"), ' ', $xpath);
    // Deal with quotes/apos
    $trans = array("='" => '="', "'\s" => '"\s', "']" => '"]');
    $xpath = strtr($xpath, $trans);
    $xpath = preg_replace('/^\/*node/', '//node', $xpath);
    $_SESSION['xpath'] = $xpath;
?>
  <p>You can search an entire treebank (default), or select just one or more components. Due to pre-processing difficulties
    some sentences could not be included in the system, so the sentence and word counts may slightly differ from the official treebank counts.</p>

    <p>Which treebank do you want to query? Click on the treebank name to see its different components. If you would like to get more information
    on these treebanks, you can find their project websites in <a href='<?php echo "$home/documentation.php#faq-3"; ?>'>our FAQ</a>.</p>
  <form action="results.php" method="post">
    <div class="label-wrapper"><label><input type="radio" name="treebank" value="cgn"> CGN</label></div>
    <div class="label-wrapper"><label><input type="radio" name="treebank" value="lassy"> Lassy</label></div>

    <div class="cgn" style="display:none">
      <?php require "$scripts/tb-cgn.php"; ?>
    </div>
    <div class="lassy" style="display:none">
      <?php require "$scripts/tb-lassy.php"; ?>
    </div>
    <?php setContinueNavigation(); ?>
  </form>

<?php } // $continueConstraints
else {
    if ($isSpam):
        setErrorHeading("Spam detected"); ?>
        <p>Your input example contained a hyperlink or email address and is seen as spam. Therefore we will not allow you to continue. </p>
    <?php else:
        setErrorHeading(); ?>
        <p>No search instruction could be generated, since you did not enter a valid XPath query.
            It is also possible that you came to this page directly without first entering a query.</p>
    <?php
    endif;
    setPreviousPageMessage($step-1);
}
?>

<?php
require "$php/footer.php";
include "$root/scripts/AnalyticsTracking.php";
?>
</body>
</html>
