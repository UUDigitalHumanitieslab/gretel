<?php

$currentPage = 'ebs';
$step = 4;

require '../config/config.php';
require "$root/helpers.php";
require "$root/functions.php";
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

  require "$root/basex-search-scripts/basex-client.php";
  require "$root/preparatory-scripts/treebank-availability.php";
}

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
else:
  require "$root/front-end-includes/tb-sel-shared-content.php";

  setContinueNavigation(); ?>
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
