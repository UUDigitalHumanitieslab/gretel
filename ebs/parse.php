<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require "../config/config.php";
$currentPage="ebs";
$step=2;

$id=session_id();
$date=date('d-m-Y');
$time=time();

if (getenv('REMOTE_ADDR')){
$user = getenv('REMOTE_ADDR');
}
else {
$user="anonymous";
}

if (isset($_POST['input'])) $input = $_POST['input'];
// set search mode
if(isset($_POST['search'])) {
  if ($_POST['search']=="basic") {
    $_SESSION['search']="basic";
  }
  else {
    $_SESSION['search']="advanced";
  }
  $sm=$_SESSION['search'];
}

require "$root/functions.php";
require "$root/php/head.php";
require "$scripts/Tokenizer.php";
require "$scripts/SimpleDOM.php";
require "$scripts/AlpinoParser.php";
require "$scripts/ModifyLemma.php";

?>

<link rel="stylesheet" href="<?php echo $home; ?>/style/css/tree-visualizer.css">
</head>


<?php
require "$root/php/header.php";

$error_flag = checkInputAndLog();

if (!$error_flag) {
  $tokinput = Tokenize($input);
  $_SESSION['sentence']="$tokinput";
  $parse = Alpino($tokinput,$id); // $parse = parse location
  $parseloc=ModifyLemma($parse,$id, $tmp); // returns parse location
}
?>

<?php if (!$error_flag) : ?>
  <p>You find the structure of the <strong>tagged</strong>
    and <strong>parsed</strong> sentence below.
    Tagging indicates <em>word classes</em>, like <strong>n</strong> (noun)
    and parsing shows <em>dependencies</em> (or relations),
     like <strong>su</strong> (subject) and <em>constituents</em>,
     like <strong>np</strong> (noun phrase).
  </p>

  <p>Your input sentence was: <em><?php echo $tokinput; ?></em></p>

  <div id="tree-output"></div>

  <form action="matrix.php" method="post" enctype="multipart/form-data">
    <p>If the analysis is different from what you expected, you can enter
      <a href="<?php echo $home; ?>/ebs/input.php" title="Example-based search">another input example</a>.
    </p>
    <div class="continue-btn-wrapper"><button type="submit">Continue <i>&rarr;</i></button></div>
  </form>
  <?php endif; ?>
  </main>
</div>

<?php
require "$root/php/footer.php";
include "$root/scripts/AnalyticsTracking.php";
?>

<?php if (!$error_flag) : ?>
  <script src="<?php echo $home; ?>/js/tree-visualizer.js"></script>
  <script>
  $(document).ready(function(){
      $("#tree-output").treeVisualizer('<?php echo "$home/tmp/$id"; ?>-pt.xml');
  });
  </script>
<?php endif; ?>
</body>
</html>
