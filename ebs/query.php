<html>
<!-- query.php -->
<!-- query summary -->

<!-- version 0.5 date: 15.10.2014  RELEASED WITH GrETEL2.0 -->
<!-- written by Liesbeth Augustinus (c) 2014 -->
<!-- for the GrETEL2.0 project -->

<head>
<?php
/* Display errors*/
//error_reporting(E_ALL);
//ini_set('display_errors', 1);
require 'header.php';?>
</head>

<body>
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
$sm=$_SESSION['search'];

// navigation
$start="input.php";
$next="results.php";					
$step="step_five";
$title="<h1>Step 5: Query Overview</h1><hr/>";
$new='<button type="button" onclick="window.location.href=\''.$start.'?'.$time.'\'">New Input Example</button>';
$back='<button type="button" value="Back" onclick="goBack()">Back</button>';
$continue='<div style="float:right"><button type="Submit" value="Continue" class="colour">Continue</button></div>';

// log files
$grtllog="$log/gretel-ebq.log";

if ($_POST['treebank']) {
  $treebank=$_POST['treebank']; 
  $_SESSION['treebank']="$treebank";
}
else {
  $treebank=$_SESSION['treebank']; 
}

// get subtreebanks
$subtb=$treebank.'tb';

if ($_POST[$subtb]) {
  $components=$_POST[$subtb];
  $_SESSION['subtb']=$components;
}
elseif (isset($_SESSION['subtb'])) {
  $components=$_SESSION['subtb'];
}

else {
  echo "<h1>Error</h1>";
  echo "Please select at least one subtreebank\n<br/><br/>";
  echo $back;
  exit;
}

// get context option

if (isset($_POST["ct"])) {
  $_SESSION["ct"]="on";
}
else {
  $_SESSION["ct"]="off";
}

if (getenv('REMOTE_ADDR')){
$user = getenv('REMOTE_ADDR');
}
else {
$user="anonymous";
}

if ($treebank!=="sonar") {
   $components=implode( ', ' , array_keys($components)); // get string of components
}


/***********************************************************/
/* INCLUDES */
require("$navigation");
/***********************************************************/

// get input sentence
$sentence=$_SESSION['sentence'];

// get search mode
$sm=$_SESSION['search'];

// get XPath
$xpath=$_SESSION['xpath'];

if ($xpath) {
chop($xpath);

// log XPath
$log = fopen($grtllog, "a");  //concatenate
fwrite($log, "$date\t$user\t$id-$time\t$sm\t$treebank\tAUTOXP\t$xpath");
fclose($log);

// add style to query tree
`perl  $scripts/sub2tree.pl $tmp/$id-sub.xml '//node[@rel]' 'ptsonar' > $tmp/$id-sub-style.xml`;

//print input sentence and treebank
echo "$title";
echo "<b>Input example:</b> <i>$sentence</i><br/><br/>\n";

echo "<b>Treebank:</b> ".strtoupper($treebank)."<br/>\n";
echo "<b>Components:</b> ".strtoupper($components)."<br/><br/>\n";

// print tree
$subparse=$home."/tmp/$id-sub-style.xml?$time";

echo '<table border=1 class="hd" width="100%"><tr><th>Query tree [<a href="'.$subparse.'" target="_blank">full screen</a>]</th></tr>';
echo "<td><iframe name=\"treeimg\" src=\"".$subparse."\">Sorry, your browser does not support iframes.</iframe></td></tr></table>";


if ($_SESSION['search']=="advanced") { // print XPath expression in advanced search mode

  if ($treebank=="sonar") { 
    echo '<br/><b>XPath expression </b>generated from the query tree.<br/>';
  }

  else {
    echo '<br/><b>XPath expression </b>generated from the query tree. You can adapt it if necessary. If you are dealing with a long query the <a href="http://bramvanroy.be/projects/xpath-beautifier" target="_blank">XPath beautifier</a> might come in handy. <br/>';
  }

  echo '<form action="'.$next.'" method="post">';
  if ($treebank == "sonar") {
    echo '<textarea rows="4" cols="100" name="xp" wrap="soft" readonly>'.$xpath.'</textarea><br/>';
}
  else {
    echo '<textarea rows="4" cols="100" name="xp" wrap="soft">'.$xpath.'</textarea>';
  }
  
  echo '<input type="reset" value="Reset XPath"/> ';
}

echo '
<form action="'.$next.'" method="post">
';

echo '<br/><br/>';

echo $new.$back.$continue;
echo '</form>';
}

?>
</div>
</body>
</html>