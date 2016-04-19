<?php
require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private'); // avoids page reload when going back
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'ebs';
$step = 5;
$noTbFlag = 0;

$id = session_id();
$time = time();

// Set tokenized input sentence to variable
if (isset($_SESSION['sentence'])) {
    $tokinput = $_SESSION['sentence'];
    $sentence = explode(' ', $tokinput);
}
// Set search mode to variable
if (isset($_SESSION['search'])) {
    $sm = $_SESSION['search'];
}

if (isset($_POST['treebank'])) {
    $treebank = $_POST['treebank'];
    $_SESSION['treebank'] = $treebank;
} elseif (isset($_SESSION['treebank'])) {
    $treebank = $_SESSION['treebank'];
} else {
    $noTbFlag = 1;
    $treebank = '';
}

$subtb = $treebank.'tb';

if (isset($_POST[$subtb])) {
    $components = $_POST[$subtb];
    $_SESSION['subtb'] = $components;
} elseif (isset($_SESSION['subtb'])) {
    $components = $_SESSION['subtb'];
} else {
    $noTbFlag = 1;
}

if (isset($_POST['ct'])) {
    $_SESSION['ct'] = 'on';
} else {
    $_SESSION['ct'] = 'off';
}

if (isset($_SESSION['xpath'])) {
    $xpath = $_SESSION['xpath'];
}

$continueConstraints = !$noTbFlag && sessionVariablesSet(array('sentence', 'search', 'treebank', 'subtb', 'ct', 'xpath'));

if ($continueConstraints) $treeVisualizer = true;

require "$root/functions.php";
require "$root/php/head.php";
?>
</head>
<?php flush(); ?>
<?php require "$root/php/header.php"; ?>

<?php if ($continueConstraints) :
  if ($treebank != 'sonar') {
      $components = implode(', ', array_keys($components));
  }
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
<li>Components: <?php echo strtoupper($components); ?></li>
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
    <?php $readonly = ($treebank == 'sonar') ? 'readonly' : ''; ?>
    <textarea name="xp" wrap="soft" <?php echo $readonly;?>><?php echo $xpath; ?></textarea>

    <input type="reset" value="Reset XPath">
  <?php else : ?>
    <form action="results.php" method="post">
  <?php endif; ?>

    <?php setContinueNavigation(); ?>
  </form>
<?php else: // $continueConstraints
    setErrorHeading();
?>
    <p>You did not select a treebank, or something went wrong when determining the XPath for your request. It is also
    possible that you came to this page directly without first entering an input example.</p>

<?php
    getPreviousPageMessage(4);
endif;
require "$root/php/footer.php";
include "$root/scripts/AnalyticsTracking.php";

if ($continueConstraints) : ?>
    <div class="loading-wrapper">
        <div class="loading"><p>Searching...<br>Please wait</p><button>Cancel</button></div>
    </div>
    <script src="<?php echo $home; ?>/js/tree-visualizer.js"></script>
    <script>
    $(document).ready(function() {
      var xhr;
      $("form").submit(function(e) {
          var $this = $(this);
        e.preventDefault();
        $(".loading-wrapper").addClass("active");
        var url = $(this).attr("action");
        if(xhr) {
          xhr.abort();
        }
        xhr = $.ajax({
          method: "POST",
          cache: false,
          data: $(this).serialize(),
          url: '<?php echo "$home/php/post.php"; ?>',
          complete: function(xhr, status) {
            xhr = null;
            window.location.href = '<?php echo "$home/$currentPage/"; ?>'+url;
          }
        });
      });
      $(".loading-wrapper button").click(function() {
        $(".loading-wrapper").removeClass("active");
        if(xhr) {
          xhr.abort();
        }
      });
      $(window).unload(function() {
        $(".loading-wrapper").removeClass("active");
        if(xhr) {
          xhr.abort();
        }
      });
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
