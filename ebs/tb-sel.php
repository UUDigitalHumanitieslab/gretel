<?php
session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'ebs';
$step = 4;

require "../config.php";
require ROOT_PATH."/helpers.php";
require ROOT_PATH."/functions.php";
require ROOT_PATH."/preparatory-scripts/prep-functions.php";


$continueConstraints = sessionVariablesSet(array('example', 'sentence')) && postVariablesSet(array('manualMode', 'originalXp'));
$continueConstraints = $continueConstraints && (isset($_POST['xpath']) || isset($_SESSION['xpath']));

$isSpam = false;

if ($continueConstraints) {
  $xpath = isset($_POST['xpath']) ? $_POST['xpath'] : $_SESSION['xpath'];
  $originalXp = isset($_POST['originalXp']) ? $_POST['originalXp'] : $_SESSION['originalXp'];
  $isSpam = isSpam($xpath);

  $id = session_id();

  if (!$isSpam) {
    $_SESSION['originalXp'] = $originalXp;
    $_SESSION['xpath'] = $xpath;
    $_SESSION['manualMode'] = ($_POST['manualMode'] == 'false') ? false : true;
    $_SESSION['ct'] = isset($_POST['ct']) ? true : false;
  }
}
session_write_close();
require ROOT_PATH."/front-end-includes/head.php";
?>
</head>
<?php flush(); ?>
<?php require ROOT_PATH."/front-end-includes/header.php";

if ($continueConstraints && !$isSpam):
  if (!file_exists(ROOT_PATH."//tmp/$id-sub.xml") || filesize(ROOT_PATH."//tmp/$id-sub.xml") == 0 || !$continueConstraints):
    setErrorHeading();
  ?>

  <p>No search instruction could be generated, since nothing was indicated in the matrix or no sentence was entered.
        It is also possible that you came to this page directly without first entering an input example.</p>

  <?php setPreviousPageMessage(3);
  else:
    require ROOT_PATH."/front-end-includes/tb-sel-shared-content.php";
    setContinueNavigation(); ?>
    </form>
  <?php endif;
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

require ROOT_PATH."/front-end-includes/footer.php";
include ROOT_PATH."/front-end-includes/analytics-tracking.php";

?>
</body>
</html>
