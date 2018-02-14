<html>
<!-- tb-sel-re.php -->
<!-- script for treebank selection -->
<!-- written by Liesbeth Augustinus (c) 2017 -->
<!-- for the GrETEL project -->

<head>
<?php
/* Display errors*/
//error_reporting(E_ALL);
//ini_set('display_errors', 1); 
require 'header-re.php';?>

<style type="text/css">
.box{
 padding: 20px;
 display: none;
 margin-top: 20px;
 }
fieldset {
 border: none;
}
</style>

<script>
// checkall LASSY function
$(function () { // this line makes sure this code runs on page load
    $('.checkall').click(function () {
	$(this).parents('fieldset:eq(0)').find(':checkbox').attr('checked', this.checked);
      });
  });
// checkall CGN function
$(function () { // this line makes sure this code runs on page load
    $('.checknlfunction').click(function () {
	$(this).parents('fieldset:eq(0)').find(':checkbox.checknl').attr('checked', this.checked);
      });
  });
$(function () { // this line makes sure this code runs on page load
    $('.checkvlfunction').click(function () {
	$(this).parents('fieldset:eq(0)').find(':checkbox.checkvl').attr('checked', this.checked);
      });
  });
// show/hide subtreebanks
$(document).ready(function(){

    $('input[type="radio"]').click(function(){
	if($(this).attr("value")=="cgn"){
	  $(".box").hide();
	  $(".cgn").show();
	}
	if($(this).attr("value")=="lassy"){
	  $(".box").hide();
	  $(".lassy").show();
	}
      });
  });

$(document).ready(function(){
    if (document.getElementById('cgn').checked) {
      $(".box").hide();
      $(".cgn").show();
    }
    if (document.getElementById('lassy').checked) {
      $(".box").hide();
      $(".lassy").show();
    }
  });
</script>
<script type="text/javascript">
// show loading div
$(document).ready(function(){
    $('button[type="submit"]').click(function(){
	$(".loading").show();
      });
  });
</script>
</head>

<body>
<div class="loading" style="display:none;">
<p>Loading... Please wait</p>
</div>
<div id="container">
<?php
session_cache_limiter('private'); // avoids page reload when going back
session_start();
header('Content-Type:text/html; charset=utf-8');

/***********************************************************/
/* VARIABLES */
$id= session_id();
$date=date('d-m-Y');
$time=time();

if (getenv('REMOTE_ADDR')){
$user = getenv('REMOTE_ADDR');
}
else {
$user="anonymous";
}

// dir to treebank tables
$lassytable="$scripts/lassy-tb.html";
$cgntable="$scripts/cgn-tb.html";

// log files
$grtllog="$log/gretel-re.log";

// navigation
$start="input-re.php?time()";
$next="results-re.php";
$new='<button type="button" onclick="window.location.href=\''.$start.'?'.$time.'\'">New query</button>';
$back='<button type="button" value="Back" onclick="goBack()">Back</button>';
$continue='<div style="float:right"><button type="Submit" value="Continue" class="colour">Continue</button></div>';
$step="step_two"; // for progress bar
$title="<h1>Step 2: Select a treebank</h1><hr/>";
$info='<p>You can search an entire treebank (default), or select just one or more components.</p>';
$info2='<p>Due to pre-processing difficulties some sentences could not be included in the system, so the sentence and word counts may slightly differ from the official treebank counts.</p>';
$captcha="<p>This is a suspicious input example. GrETEL does not accept URL's or HTML as input.</p>";

/***********************************************************/
/* INCLUDES */
require("$navigation");
/***********************************************************/

// get input

if (isset($_POST["string"]) && $_POST["string"]!="") {
  $input=$_POST['string']; // get input
}

else {
  echo "<h1>Input Error</h1><hr/>";
  echo "Please enter a regular expression\n<br/><br/>";
  echo $back;
  exit;
}

// get case option
if (isset($_POST["case"])) {
  $_SESSION["case"]=$_POST["case"];
}
else {
  $_SESSION["case"]="CI";
}

// get word boundary option
if (isset($_POST["wb"])) {
  $_SESSION["wb"]="on";
}
else {
  $_SESSION["wb"]="off";
}

// get context option
if (isset($_POST["ct"])) {
  $_SESSION["ct"]="on";
}
else {
  $_SESSION["ct"]="off";
}

$_SESSION['search']="research"; // set search mode
chop($input);
$input = preg_replace("/[\\n\\r]+/", " ", $input); // remove newlines and tabs

$trans = array("='" => '="', "'\s" => '"\s', "']" => '"]' ); // deal with quotes/apos
$input=strtr("$input", $trans);

if (preg_match('/(http:\/\/.*)|(<\W+>)/', $input)==1) { // check for spam
  echo "<h1>XPath Error</h1><hr/>";
  echo $captcha."\n<br/><br/>";
  echo $back;
  exit;
}

else { 
  echo "$title";
  $_SESSION['string']=$input;
}

// print treebank table
echo 'Which <b>treebank</b> do you want to query? Click on the treebank name to see its different <b>components</b>.<br/><br/>';
echo '<form action="'.$next.'" method="post" >';
echo '<div>
        <b><label><input type="radio" name="treebank" value="cgn" id="cgn">CGN</label> treebank</b>: spoken Dutch -- version 2.0.1 <br/>
        <b><label><input type="radio" name="treebank" value="lassy" id="lassy"  checked>LASSY</label> Small</b>: written Dutch -- version 1.1<br/>
        </div>';

echo "$info";
echo "$info2";
echo '<div class="cgn box">';
require("$cgntable");
echo '</div>';
echo '<div class="lassy box">';
require("$lassytable");
echo '</div>';

echo $new.$continue;

echo '</form>';
echo '<br/>';
require 'footer.php';
?>
</div>
</body>
</html>