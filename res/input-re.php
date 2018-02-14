<html>
<!-- input-re.php -->
<!-- form to get an regular expression -->
<!-- written by Liesbeth Augustinus (c) 2017 -->
<!-- for the GrETEL project -->

<head>
<?php
/* Display errors*/
//error_reporting(E_ALL);
//ini_set('display_errors', 1); 
require 'header-re.php';?>

<script>
// clear function
function copyText()
{
document.getElementById("string").value=document.getElementById("clear").value;
}

// back function
function goBack() {
    window.history.back()
}

</script>
</head>

<body>
<div id="container">
<?php
session_start();
header('Content-Type:text/html; charset=utf-8');

/************************************************************/
 /* VARIABLES */
$id=session_id();
$next="tb-sel-re.php";
$input='een voorbeeld'; // default example
$step="step_one"; // for progress bar
$title="<h1>Step 1: Give a regular expression</h1>
<hr/>";
$continue='<div style="float:right"><button type="Submit" value="Continue" class="colour">Continue</button></div>';

/***********************************************************/
/* INCLUDES */
require("$navigation");
/***********************************************************/

echo "$title";

echo '<form action="'.$next.'" method="post" enctype="multipart/form-data" >
<p> Enter an <b>input string</b> or a <b><a href="https://msdn.microsoft.com/en-us/library/az24scfc.aspx" target="_blank">regular expression</a></b> (without slashes):</p>';

if (isset($_SESSION['string'])) { // find previous input example
  $input=$_SESSION['string'];
}

echo '
<input type="text" name="string" size=50 value="'.$input.'" id="string" />
<button type="button" onClick="copyText();" id="clear">Clear</button><br/><br/><br/>
';

echo '
<b>OPTIONS</b><br/><br/>
<input type="checkbox" name="wb" value="on" checked/>Word boundaries<br/><br/>

<input type="radio" name="case" value="CI" checked />Case insensitive search [CI]<br/>
<input type="radio" name="case" value="CS" />Case sensitive search [CS]<br/><br/>

<input type="checkbox" name="ct" value="on" />Include context (one sentence before and after the matching sentence)<br/><br/>
';

echo $continue;
echo '<br/>';
require 'footer.php';
?>
</div>
</body>
</html>