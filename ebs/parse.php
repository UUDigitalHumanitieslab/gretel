<?php
require "../config/config.php";
$currentPage="ebs";
$step=2;
session_start();
$id=session_id();
$input = $_POST['input'];
$date=date('d-m-Y');
$time=time(); // time stamp

if (getenv('REMOTE_ADDR')){
$user = getenv('REMOTE_ADDR');
}
else {
$user="anonymous";
}
// set search mode
if ($_POST['search']=="basic") {
  $_SESSION['search']="basic";
}
else {
  $_SESSION['search']="advanced";
}

$sm=$_SESSION['search'];
require "$root/functions.php";
require "$root/php/head.php";

// dir to includes
$alpino="$scripts/AlpinoParser.php";
$tokenizer="$scripts/Tokenizer.php";
$simpledom="$scripts/SimpleDOM.php";
$modlem="$scripts/ModifyLemma.php";

// log files
$grtllog="$log/gretel-ebq.log";

?>

<link rel="stylesheet" href="<?php echo $home; ?>/style/css/tree-visualizer.css">
</head>


<?php require "$root/php/header.php"; ?>
<?php
// messages
$captcha="This is a suspicious input example. GrETEL does not accept URL's or HTML as input.";




/***********************************************************/
/* INCLUDES */
require("$tokenizer");
require("$simpledom");
require("$alpino");
require("$modlem");
/***********************************************************/

if (preg_match('/(http:\/\/.*)|(<.*)|(.*>)/', $input)==1) { // check for spam
  echo "<h3>Error</h3>";
  echo "<p>".$captcha."</p>";
  echo $back;
  exit;
}

elseif(!$input || empty($input)) {
  echo "<h3>Error</h3>";
  echo "<p>Please provide an <b>input example</b>.</p>";
  echo $back;
  exit;
}

else { // LOG INPUT
  $log = fopen($grtllog, "a");  //concatenate sentences
  fwrite($log, "\n$date\t$user\t$id-$time\t$sm\t$input\n");
  fclose($log);
  $_SESSION['sentid']="$id-$time";
  $_SESSION['example']="$input";  // for retrieving input example on other pages
}

//ALPINO
$tokinput = Tokenize($input);
$_SESSION['sentence']="$tokinput";

$parse = Alpino($tokinput,$id); // $parse = parse location

//MODIFY LEMMA
$parseloc=ModifyLemma($parse,$id,$tmp); // returns parse location

// INFO
?>
<p>You find the structure of the <strong>tagged</strong>
   and <strong>parsed</strong> sentence below.
   Tagging indicates <em>word classes</em>, like <strong>n</strong> (noun)
  and parsing shows <em>dependencies</em> (or relations),
    like <strong>su</strong> (subject) and <em>constituents</em>,
    like <strong>np</strong> (noun phrase)</p>


<?php echo "<em>$tokinput</em></p>"; ?>

<div id="tree-output"></div>

<form action="matrix.php" method="post" enctype="multipart/form-data" >
  <p>If the analysis is different from what you expected, you can enter
    <a href="<?php echo $home; ?>/ebs/input.php" title="Example-based search">another input example</a>.</p>
  <div class="continue-btn-wrapper"><button type="submit">Continue <i>&rarr;</i></button></div>

  </form>
  </main>
  </div>

<?php
require "$root/php/footer.php";
include "$root/scripts/AnalyticsTracking.php";
?>
<script src="<?php echo $home; ?>/js/tree-visualizer.js"></script>
<script>
$(document).ready(function(){
    $("#tree-output").treeVisualizer('<?php echo "$home/tmp/$id"; ?>-pt.xml');
});
</script>
</body>
</html>
