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
$treebanksearch="$scripts/TreebankSearch.php";
$formatresults="$scripts/FormatResults.php";

/* GET VARIABLES */
$subtb=$_GET["subtb"]; // get subtreebanks
if (getenv('limit')){
  $limit=$_GET["limit"]; // get limit
}
$print=$_GET["print"]; // get print mode

$treebank=$_SESSION['treebank']; // get treebank
$xpath=$_SESSION['xpath']; // get xpath
$example=$_SESSION['example']; // get input example
$context=$_SESSION['ct'];

 if ($_SESSION["ct"]=="on") {
    $context=1;
  }
  else {
    $context=0;
  }
/***********************************************************/
/* INCLUDES */

require "$basexclient";
require "$treebanksearch";
require "$formatresults";

/***********************************************************/

//create session
$session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

$subtreebanks=explode('-', $subtb);

try {
  // print results
  if ($print == "txt") {
    header("Content-type:text/plain; charset=utf-8");
    list($sentences,$counthits,$idlist,$beginlist)=GetSentences($xpath,$treebank,$subtreebanks,$session,"none",$context);
    echo "XPATH: $xpath\n";
    printMatchesTxt($sentences,$counthits);
  }

  elseif ($print == "csv") {
    header("Content-type:text/plain; charset=utf-8");
    list($HITS,$MS,$TOTALS,$TOTALCOUNTS)=GetCounts($xpath,$treebank,$subtreebanks,$session);
    list($sentences,$counthits,$idlist,$beginlist)=GetSentences($xpath,$treebank,$subtreebanks,$session,"none",$context);
    printCountsCsv($treebank,$HITS,$MS,$TOTALS,$TOTALCOUNTS);
  }

  elseif ($print == "html" ) {
    header('Content-Type:text/html; charset=utf-8');
    $htmlopen='<html><head><title>Search Results</title></head><body>';
    $htmlclose='</body></html>';
    $printbuttons='<input type="button" Value="Print" onClick="window.print()"/>
       <input type="button" Value="Close Window" onClick="window.close()"/>';
    echo "$htmlopen\n";
    echo "$printbuttons\n";

    echo "<h1>GrETEL Search Results</h1><hr/>\nXPath: $xpath<br/>\n";
    if ($_SESSION['search']!=="xpsearch" && isset($example)){
      echo "Based on input example: $example<br/><br/>\n";
    }
    else {
      echo "<br/><br/>\n";
    }


    // format counts
    list($HITS)=NumFormatHash($HITS);
    list($MS)=NumFormatHash($MS);
    list($TOTALS)=NumFormatHash($TOTALS);
    list($TOTALCOUNTS)=NumFormatHash($TOTALCOUNTS);

    printCountsPF($treebank,$HITS,$MS,$TOTALS,$TOTALCOUNTS); // print counts

    printMatchesPF($sentences,$counthits,$idlist,$beginlist); // print matching sentences

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

// close session
$session->close();

?>
