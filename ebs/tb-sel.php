<?php

$currentPage = 'ebs';
$step = 4;

require '../config/config.php';
require "$root/helpers.php";
require "$root/preparatory-scripts/prep-functions.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$continueConstraints = sessionVariablesSet(array('example', 'sentence')) && postVariablesSet(array('manualMode', 'originalXp'));
$continueConstraints = $continueConstraints && (isset($_POST['xpath']) || isset($_SESSION['xpath']));

$isSpam = false;

if ($continueConstraints) {
  $xpath = isset($_POST['xpath']) ? $_POST['xpath'] : $_SESSION['xpath'];

  $isSpam = isSpam($xpath);

  $id = session_id();
}

require "$root/functions.php";
require "$root/front-end-includes/head.php";
?>
</head>
<?php flush(); ?>
<?php
require "$root/front-end-includes/header.php";

if ($continueConstraints && !$isSpam):
  $originalXp = $_POST['originalXp'];
  $manualMode = ($_POST['manualMode'] == 'false') ? false : true;
  $_SESSION['manualMode'] = $manualMode;

  $_SESSION['ct'] = isset($_POST['ct']) ? true : false;

  // Clean up XPath and original XPath
  $trans = array("='" => '="', "' " => '" ', "']" => '"]', "\r" => ' ', "\n" => ' ', "\t" => ' ');

  $xpath = strtr($xpath, $trans);
  $originalXp = strtr($originalXp, $trans);

  $xpath = rtrim($xpath);
  $originalXp = rtrim($originalXp);

  $xpath = preg_replace('/^\/*/', '', $xpath);
  $originalXp = preg_replace('/^\/*/', '', $originalXp);

  // Check if the XPath was edited by the user or not
  $xpChanged = ($xpath == $originalXp) ? false : true;

  $_SESSION['xpChanged'] = $xpChanged;

  $_SESSION['xpath'] = $xpath;
  $_SESSION['originalXp'] = $originalXp;

  session_write_close();

  if (!file_exists("$tmp/$id-sub.xml") || filesize("$tmp/$id-sub.xml") == 0 || !$continueConstraints):
    setErrorHeading();
?>

    <p>No search instruction could be generated, since nothing was indicated in the matrix or no sentence was entered.
        It is also possible that you came to this page directly without first entering an input example.</p>
<?php
    setPreviousPageMessage(3);
else: ?>
  <p>You can search an entire treebank (default), or select just one or more components.
    For SoNaR it is currently only possible to select one component at a time. Due to pre-processing difficulties
    some sentences could not be included in the system, so the sentence and word counts may slightly differ from the official treebank counts.
    Additionally, some SoNaR components cannot be queried using GrETEL (yet), as they lack some of the linguisitic annotations.
    If this is fixed in an updated version of SoNaR, those components will be included as well.</p>

  <p>Which treebank do you want to query? Click on the treebank name to see its different components. If you would like to get more information
  on these treebanks, you can find their project websites in <a href="documentation.php#faq-3"
  title="Where can I find more information about the corpora available in GrETEL?">our FAQ</a>.</p>
  <form action="ebs/query.php" method="post">
    <div class="label-wrapper"><label><input type="radio" name="treebank" value="cgn"> CGN</label></div>
    <div class="label-wrapper"><label><input type="radio" name="treebank" value="lassy"> Lassy</label></div>
    <?php if (!$xpChanged): ?>
      <div class="label-wrapper"><label><input type="radio" name="treebank" value="sonar"> SoNaR</label></div>
      <div class="sonar" style="display:none">
        <?php require "$root/front-end-includes/tb-sonar.php"; ?>
      </div>
    <?php endif; ?>

    <div class="cgn" style="display:none">
      <?php require "$root/front-end-includes/tb-cgn.php"; ?>
    </div>
    <div class="lassy" style="display:none">
      <?php require "$root/front-end-includes/tb-lassy.php"; ?>
    </div>

    <?php setContinueNavigation(); ?>
  </form>
<?php endif; ?>

<?php
else:
  if($isSpam):
    setErrorHeading("spam detected"); ?>
    <p>Your XPath contained a hyperlink or email address and is seen as spam. Therefore we will not allow you to continue. </p>
  <?php else:
  setErrorHeading(); ?>
  <p>No search instruction could be generated since you did not enter a sentence.
    It is also possible that you came to this page directly without first entering a query.</p>
  <?php endif;
    setPreviousPageMessage($step - 1);
endif;

require "$root/front-end-includes/footer.php";
include "$root/front-end-includes/analytics-tracking.php";
?>
</body>
</html>
