<html>
<!-- tb-sel.php -->
<!-- script for treebank selection; generates query tree and XPath in the background -->

<!-- version 0.9 date: 17.11.2019  disable SoNaR search -->
<!-- version 0.8 date: 19.03.2015  bug fix (add -CS for utf8 output) -->
<!-- version 0.7 date: 12.12.2014  bug fix -->
<!-- version 0.6 date: 15.10.2014  RELEASED WITH GrETEL2.0 -->
<!-- written by Liesbeth Augustinus (c) 2014 -->
<!-- for the GrETEL2.0 project -->


<head>
<?php
/* Display errors*/
//error_reporting(E_ALL);
//ini_set('display_errors', 1);

require 'header.php';?>

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

if (getenv('REMOTE_ADDR')){
$user = getenv('REMOTE_ADDR');
}
else {
$user="anonymous";
}

// dir to treebank tables
$lassytable="$scripts/lassy-tb.html";
$cgntable="$scripts/cgn-tb.html";
$sonartable="$scripts/sonar-tb.html";

// log files
$grtllog="$log/gretel-ebq.log";

// navigation
$start="input.php?time()";
$next="query.php";
$new='<button type="button" onclick="window.location.href=\''.$start.'?'.$time.'\'">New Input Example</button>';
$back='<button type="button" value="Back" onclick="goBack()">Back</button>';
$continue='<div style="float:right"><button type="Submit" value="Continue" class="colour">Continue</button></div>';
$step="step_four"; // for progress bar
$title="<h1>Step 4: Select a treebank</h1><hr/>";

$info='<p>
You can search an entire treebank (default), or select just one or more components. <!--  For SoNaR it is currently only possible to select one component at a time.--></p>';

$info2='<p>
Due to pre-processing difficulties some sentences could not be included in the system, so the sentence and word counts may slightly differ from the official treebank counts. </p>';

$warning='<p>
The SoNaR treebank is no longer available in GrETEL 2.0. An updated version is available via <a href="http://gretel.ccl.kuleuven.be/gretel3">GrETEL 3</a>.
Some SoNaR components cannot be queried using GrETEL (yet), as they lack some of the linguisitic annotations. If this is fixed in an updated version of SoNaR, those components will be included as well.</p>';

/***********************************************************/
/* INCLUDES */
require("$navigation");
/***********************************************************/

// get input
$lpxml = simplexml_load_file("$tmp/$id-pt.xml"); // read alpino pt parse
$sentence = $_SESSION['sentence']; // get input sentence
$sentencearray = explode(" ", $sentence);

// add info annotation matrix to alpino parse
foreach($sentencearray as $begin => $word) { 
  //$word=preg_replace('/\"/','&quot;' , $word); // deal with quotes
  //$word=preg_replace('/\'/','&apos;' , $word); // deal with apostrophes
  $postword=preg_replace('/\./','_' , $word); // dots are internally changed to underscores in POST variables
  $postvalue=$_POST["$postword--$begin"];
  
  if (preg_match("/([_<>\.,\?!\(\)\"\'])|(\&quot;)|(\&apos;)/", $word)) { //for punctuation (!) . changes to _ (!)
    $xp = $lpxml->xpath("//node[@begin='$begin']");
  }
  else {
    $xp = $lpxml->xpath("//node[@word='$word' and @begin='$begin']");
  }
  foreach ($xp as $x) {
    $x->addAttribute("interesting", "$postvalue");
  }
}

// save parse with @interesting annotations
$inttree = fopen("$tmp/$id-int.xml", "w"); 
$tree = $lpxml->asXML();
fwrite($inttree, "$tree");
fclose($inttree);


// get query tree
if (isset($_POST['topcat'])) {
  $topcat=$_POST['topcat'];
  $remove="-r relcat";
}
else {
  $remove="-r rel";
}

`perl -CS $scripts/GetSubtree.pl -xml $tmp/$id-int.xml -m "sonar" $remove -split > $tmp/$id-sub.xml`;

if (isset($_POST['order'])) {
  $order="-order"; 
  $_SESSION["order"]="on"; 
}

else {
  $order=" "; 
}

// get XPath
$attsout="-ex postag,begin"; // attributes to be excluded from XPath
$xpath = `perl -CS $scripts/XPathGenerator.pl -xml $tmp/$id-sub.xml $attsout $order`;
$xpath = preg_replace('/@cat="\s+"/',"@cat",$xpath); // underspecify empty attribute values
$_SESSION['xpath']="$xpath";

if (filesize("$tmp/$id-sub.xml") == 0) {
  echo "<b>ERROR:</b> No search instruction could be generated, since nothing was indicated in the matrix. Please go back and indicate at least one item in the matrix.<br/><br/>\n";
  echo $back."<br/>";
}

else { 
// print info
  echo "$title";

// print treebank table
  echo 'Which <b>treebank</b> do you want to query? Click on the treebank name to see its different <b>components</b>.<br/><br/>';
  echo '<form action="'.$next.'" method="post" >';
  echo '<div>
        <b><label><input type="radio" name="treebank" value="cgn" id="cgn">CGN</label> treebank</b>: spoken Dutch -- version 2.0.1 <br/>
        <b><label><input type="radio" name="treebank" value="lassy" id="lassy"  checked>LASSY</label> Small</b>: written Dutch -- version 1.1<br/>
        <!-- b> <label><input type="radio" name="treebank" value="sonar" id="sonar" >SoNaR</label> treebank</b>: written Dutch -- version 1.0<br/ -->
        </div>';

  echo "$info";
  echo "$info2";
  echo "$warning";
  echo '<div class="cgn box">';
  require("$cgntable");
    // include context
  echo '<p><b>OPTION</b></p>
  <input type="checkbox" name="ct" value="on" />Include context (one sentence before and after the matching sentence)';
  echo '</div>';
  echo '<div class="lassy box">';
  require("$lassytable");
    // include context
  echo '<p><b>OPTION</b></p>
  <input type="checkbox" name="ct" value="on" />Include context (one sentence before and after the matching sentence)';
  echo '</div>';
  echo '<div class="sonar box">';
  require("$sonartable");
  echo '</div>';

  echo '<br/><br/>';
  echo $new.$back.$continue;
  
  echo '</form>';

}

?>
<br/><br/><br/>
<hr>
<div id="footer">
<p>version <?php echo "$version";?>  &copy; 2016 Liesbeth Augustinus</p>
</div>
</div>
</body>
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
	if($(this).attr("value")=="sonar"){
	  $(".box").hide();
	  $(".sonar").show();
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
    if (document.getElementById('sonar').checked) {
      $(".box").hide();
      $(".sonar").show();
    }
  });
</script>

</html>