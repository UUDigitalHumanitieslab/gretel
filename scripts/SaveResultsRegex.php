<?php
session_start();

/*
SaveResults.php

 script exports query results to a file (as txt/csv)
 obligatory arguments: print mode, subtreebanks
 optional argument: limit (search results)

 version 0.2 date: 15.10.2014  RELEASED WITH GrETEL2.0
 written by Liesbeth Augustinus (c) 2014
 for the GrETEL2.0 project
*/

/***********************************************************/
 /* VARIABLES */
$id=session_id();
$date=date('d-m-Y');
$time=time(); // time stamp

// load configuration file 
require("../config/config.php");

// dir to external scripts
$basexclient="$scripts/BaseXClient.php";
$treebanksearch="$scripts/RegExSearch.php";
$formatresults="$scripts/FormatResults.php";

/* GET VARIABLES */
$subtb=$_GET["subtb"]; // get subtreebanks
if (getenv('limit')){
  $limit=$_GET["limit"]; // get limit
}
$print=$_GET["print"]; // get print mode

$treebank=$_SESSION['treebank']; // get treebank
$regex=$_SESSION['regex']; // get regex
$context=$_SESSION['ct'];

 if ($_SESSION["ct"]=="on") {
    $context=1;
  }
  else {
    $context=0;
  }

$case=$_SESSION["case"];
/***********************************************************/
/* INCLUDES */

require("$basexclient");
require("$treebanksearch");
require("$formatresults");

/***********************************************************/

//create session
  $pgname=$treebank;
  $conn_string="dbname=$pgname host=$pghost port=$pgport user=$pguser password=$pgpwd";
  $session=pg_connect($conn_string) or die('connection failed');

$subtreebanks=explode('-', $subtb);

try {
   // get counts and sentences
    list($HITS,$MS,$TOTALS,$TOTALCOUNTS,$sentences,$counthits,$wordlist) = GetResults($regex,$case,$treebank,$subtreebanks,$session,$context); 

  
  // print results
  
  if ($print == "txt") {
    header("Content-Disposition: attachment; filename=DBresults.txt");
    header("Content-type:text/plain; charset=utf-8");
    echo "REGEX: $regex\n\n";
    printMatchesTxt($sentences,$counthits);
  }
  
  elseif ($print == "csv") {
    header("Content-Disposition: attachment; filename=DBresults.csv");
    header("Content-type:text/plain; charset=utf-8");   
    
     if ($TOTALCOUNTS['hits']==0) {
      print "NO MATCHES FOUND\n";
    }
    
    else {
      printCountsCsv($treebank,$HITS,$MS,$TOTALS,$TOTALCOUNTS); // print table with results
    }
  }
  
  elseif ($print == "html" ) {
    header('Content-Type:text/html; charset=utf-8');
    $htmlopen='<html><head><title>Search Results</title></head><body>';
    $htmlclose='</body></html>';    
    $printbuttons='<input type="button" Value="Print" onClick="window.print()"/>
       <input type="button" Value="Close Window" onClick="window.close()"/>';
    echo "$htmlopen\n";
    echo "$printbuttons\n";

    echo "<h1>GrETEL Search Results</h1><hr/>\n<b>RegEx: </b>$regex<br/><br/><br/>\n";
  
  
    // format counts
    list($HITS)=NumFormatHash($HITS);
    list($MS)=NumFormatHash($MS);
    list($TOTALS)=NumFormatHash($TOTALS);
    list($TOTALCOUNTS)=NumFormatHash($TOTALCOUNTS);

    printCountsPF($treebank,$HITS,$MS,$TOTALS,$TOTALCOUNTS); // print counts

    printMatchesRegexPF($sentences,$counthits,$regex); // print matching sentences
    
    echo "$printbuttons\n";
    echo $htmlclose;
  }
  
  else {
    header("Content-Disposition: attachment; filename=DBresults.txt");
    header("Content-type:text/plain; charset=utf-8");
    print "An error occurred.\n";
  }
  
}

catch (Exception $e) {
  // print exception
  $error=$e->getMessage();
  echo $error;
}

?>