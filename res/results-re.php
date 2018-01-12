<html>
<!-- results-re.php -->
<!-- display treebank results -->
<!-- written by Liesbeth Augustinus (c) 2017 -->
<!-- for the GrETEL project -->

<head>
<?php 
/* Display errors*/
//error_reporting(E_ALL);
//ini_set('display_errors', 1); 
require 'header-re.php';

echo '
<link rel="stylesheet" type="text/css" href="'.$home.'/style/css/datatable.css"></link>

<script type="text/javascript" src="'.$home.'/js/jquery-2.0.2.min.js" ></script>
<script type="text/javascript" src="'.$home.'/js/jquery.dataTables.js" ></script>
<script type="text/javascript" src="'.$home.'/js/sorttable.js" ></script>
';
?>
<script>

// Initialisation code dataTables
$(document).ready(function() {
	$('#example').dataTable( {
	    "sScrollY": "400px",
	      "bPaginate": false,
	      } );
  });
      

// show/hide function
$(document).ready(function(){

    $(".slidingDiv").hide();
    $(".show_hide").show();
     $("#hide").hide(); // hide message 'hide'
    $("#show").show(); // show message 'show'

    $('.show_hide').click(function(){
	$(".slidingDiv").slideToggle();
	if ($('#show').is(":visible")){
	  $("#show").hide(); 
	  $("#hide").show();
	}
	else {
	  $("#show").show();
	  $("#hide").hide(); 
	}
      });

  });

</script>

</head>

<body>
<div id="container">
<?php
session_cache_limiter('private'); // avoids page reload when going back
session_start();
header('Content-Type:text/html; charset=utf-8');

/***********************************************************/

 /* VARIABLES */
$id=session_id();
$date=date('d-m-Y');
$time=time(); // time stamp
$limit=1000;

if (getenv('REMOTE_ADDR')){
$user = getenv('REMOTE_ADDR');
}
else {
$user="anonymous";
}

// dir to to external scripts
$basexclient="$scripts/BaseXClient.php";
$treebanksearch="$scripts/RegExSearch.php";
$formatresults="$scripts/FormatResults.php";

// log files
$oomlog="$log/oom.log";
$grtllog="$log/gretel-res.log";

// navigation and references to scripts
$start="input-re.php";
$new='<button type="button" onclick="window.location.href=\''.$start.'?'.$time.'\'">New Query</button>';
$back='<button type="button" value="Back" onclick="goBack()">Back</button>';
$step="step_three";
$title="<h1>Step 3: Results</h1><hr/>";

// messages and documentation
$export="$home/scripts/SaveResultsRegex.php?"; // script for downloading the results
$showtree="$home/scripts/ShowTree.php"; // script for displaying syntax trees
$tip="<b>Click on a sentence ID</b> to view the tree structure. The
sentence ID refers to the treebank component in which the sentence occurs, the text number, and the location within the text (page + sentence number).";
/***********************************************************/
/* INCLUDE SCRIPTS */

require("$navigation");
require("$basexclient");
require("$treebanksearch"); // functions to find treebank data in BaseX database and print them
require("$formatresults"); // functions to format the treebank results

/***********************************************************/

  // get input
  if (empty($_SESSION['string'])) {
    echo "<h1>Input Error</h1><hr/>";
    echo "Please enter a query\n<br/><br/>";
    echo $back;
    exit;
  }
  
  else {
    $string=$_SESSION['string'];
  }
  
  echo "$title";
  chop($string);

  // get treebank
  if ($_POST['treebank']) {
    $treebank=$_POST['treebank']; 
    $_SESSION['treebank']="$treebank";
  }
  else {
    echo "<h1>Error</h1>";
    echo "Please select at least one treebank\n<br/><br/>";
    echo $back;
    exit;
  }
 
  // log input
  $log=fopen($grtllog, "a"); //concatenate
  fwrite($log, "$date\t$user\t$id-$time\t$treebank\t$string\n");
  fclose($log);

  // get subtreebanks
  $subtb=$treebank.'tb';
  
  if ($_POST[$subtb]) {
    $components=$_POST[$subtb];
    $subtreebanks=array_keys($components);
    $subtbs=implode('-', $subtreebanks);
    $components=implode( ', ' , $subtreebanks); // get string of components
    $export .= "subtb=".$subtbs;
  }
  
  else {
    echo "<h1>Error</h1>";
    echo "Please select at least one subtreebank\n<br/><br/>";
    echo $back;
  exit;
  }

  // get word boundary option
  if ($_SESSION["wb"]=="on") {
     $wb=1;
     $string='\\b'.$string.'\\b'; // add word boundary symbol
     $_SESSION['regex']=$string;
  }

  else {
    $wb=0;
    $_SESSION["wb"]="off";
    $_SESSION['regex']=$string;
  }
  
  // get case option
  if (isset($_SESSION["case"])) {
    $case=$_SESSION["case"];
  }
  else {
    $case="CI";
  }
  
// get context option
  if (isset($_POST["ct"])) {
    $context=1;
    $_SESSION["ct"]="on";
  }
  else {
    $context=0;
    $_SESSION["ct"]="off";
  }

  // create session

  $pgname=$treebank;
  $conn_string="dbname=$pgname host=$pghost port=$pgport user=$pguser password=$pgpwd";
  $session=pg_connect($conn_string) or die('connection failed');

  // get results
  try {
    // get counts and sentences
    list($HITS,$MS,$TOTALS,$TOTALCOUNTS,$sentences,$counthits,$wordlist) = GetResults($string,$case,$treebank,$subtreebanks,$session); 
 
 
  // print query

    echo 
'<div align="right"><button type="button" value="Printer-friendly version" onclick="window.open(\''.$export.'&print=html\')">Printer-friendly version</button></div>';

    echo '
<table>
<tr>
<th colspan="2" align="left">QUERY</th>
</tr>
<tr>
<th  align="left">RegEx</th><td>'.$string.'</td>
</tr>
<tr>
<th  align="left">Treebank</th><td>'.strtoupper($treebank).' ['.$components.']</td>
</tr>
</table><br/>
'; 

    if ($TOTALCOUNTS['hits']==0) {
      print "<b>RESULTS: </b>NO MATCHES FOUND<br/><br/>\n";
    }
    
    else {
      // format counts
      list($HITS)=NumFormatHash($HITS);
      list($MS)=NumFormatHash($MS);
      list($TOTALS)=NumFormatHash($TOTALS);
      list($TOTALCOUNTS)=NumFormatHash($TOTALCOUNTS);
      
      echo '
<table>
<tr>
<th colspan="3" align="left">RESULTS</th>
</tr>
<tr>
<th align="left" width="200px">Hits</th><td>'.$TOTALCOUNTS['hits'].'</td>
<td><a href="#restable" class="show_hide" id="restable"><div id="show" class="showhide">Show hits distribution </div><div id="hide" class="showhide">Hide hits distribution</div> </a> </td>
</tr>
<tr>
<th align="left" width="200px">Matching sentences</th><td>'.$TOTALCOUNTS['ms'].'</td>
<td><button  onclick="window.open(\''.$export.'&print=txt\')" >Download</button> <a href="#" class="clickMe" tooltip="Tab-separated file of sentence IDs, matching sentences, and hits per sentence"><sup>[?]</sup></a> </td>
<!-- td><a href="'.$export.'&print=txt" >Download</a> <a href="#" class="clickMe" tooltip="Tab-separated file of sentence IDs, matching sentences, and hits per sentence"><sup>[?]</sup></a> </td -->
</tr>
<tr>
<th align="left" width="200px">Sentences in treebank</th><td>'.$TOTALCOUNTS['totals'].'</td><td></td>
</tr>
</table><br/>
'; 
  
    print '<div class="slidingDiv">';  // show/hide div pt 1
    printCounts($treebank,$HITS,$MS,$TOTALS,$TOTALCOUNTS); // print table hit distribution
    echo '<button onclick="window.open(\''.$export.'&print=csv\')" title="Comma-separated file of detailed search results (counts per treebank)">Download table</button><br/><br/>';
      
    print "</div>"; // show/hide div pt 2

   
    echo $tip;
    
    printMatchesRegex($sentences,$counthits,$wordlist,$treebank,$showtree,$string,$limit); // print matching sentence and hits per sentence
    }
    
    echo $new.$back;
  }
  
  catch (Exception $e) {
    // print $e->getMessage();
    $error=$e->getMessage();
    
    if (preg_match('/\[XPST0003\]/', $error)) { // catch error to return useful error message
      print "XPATH ERROR<br/>";
      print "$error<br/><br/>";
      echo $back;
    }
    
    elseif (preg_match('/\[XPTY0004\]/', $error)) { // catch error to return useful error message
      print "OUT OF MEMORY<br/>";      
      echo $back;

      $oom = fopen($oomlog, "a");
      fwrite($oom, "$date\t$user\t$id-$time\t$string\t$error\n");
      fclose($oom);
    }
    
    else {
      print "ERROR<br/>";
      print "$error<br/>";
      echo $back;
    }
  }

echo '<br/>';
require 'footer.php';
?>
</div>
</body>
</html>
