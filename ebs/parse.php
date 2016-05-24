<?php
/**
 * EBS STEP 2: Displays a parse of the input sentence.
 *
 *
 *
 * @author Liesbeth Augustinus
 * @author Bram Vanroy
 *
 * @see /functions.php  buildEbsMatrix(), isSpam()
 */
require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = $_SESSION['ebsxps'];
$step = 2;

$continueConstraints = postVariablesSet(array('input', 'search'));

if ($continueConstraints) {
    $treeVisualizer = true;
    $id = session_id();

    $input = $_POST['input'];
    $_SESSION['example'] = $input;

    $searchMode = $_POST['search'];
    $_SESSION['search'] = $searchMode;
}

require "$root/functions.php";
require "$root/php/head.php";
?>
</head>
<?php flush(); ?>
<?php
require "$root/php/header.php";

if ($continueConstraints) {
    require "$scripts/Tokenizer.php";
    require "$scripts/SimpleDOM.php";
    require "$scripts/AlpinoParser.php";
    require "$scripts/ModifyLemma.php";

    $tokinput = Tokenize($input);
    $_SESSION['sentence'] = $tokinput;
    $parse = Alpino($tokinput, $id);
    $parseloc = ModifyLemma($parse, $id, $tmp);
?>

  <p>You find the structure of the <strong>tagged</strong>
    and <strong>parsed</strong> sentence below.
    Tagging indicates <em>word classes</em>, such as <code>n</code> (noun)
    and parsing shows <em>dependencies</em> (or relations),
     such as <code>su</code> (subject) and <em>constituents</em>,
     such as <code>np</code> (noun phrase).
  </p>

  <p>Your input sentence was: <em><?php echo $tokinput; ?></em></p>

  <div id="tree-output">
  </div>

  <form action="matrix.php" method="post" enctype="multipart/form-data">
    <p>If the analysis is different from what you expected, you can enter
      <a href="<?php echo $home; ?>/ebs/input.php" title="Example-based search">another input example</a>.
    </p>
    <?php setContinueNavigation(); ?>
  </form>
<?php
} else {
    setErrorHeading('variables undefined');
    echo '<p>It seems that you did not enter an input sentence or did not select a search mode. It is also
    possible that you came to this page directly without first entering an input example.</p>';
    setPreviousPageMessage(1);
}

require "$root/php/footer.php";
if ($continueConstraints) : ?>
  <script>
  $(document).ready(function() {
      $("#tree-output").treeVisualizer('<?php echo "$home/tmp/$id-pt.xml"; ?>');
  });
  </script>
<?php endif;
include "$root/scripts/AnalyticsTracking.php";
?>
</body>
</html>
