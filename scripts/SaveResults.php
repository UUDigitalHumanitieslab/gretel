<?php
session_start();

$id=session_id();
$date=date('d-m-Y');
$time=time();

require "../config/config.php";
if (isset($_GET["print"])) {
    $print = $_GET["print"];
}
else {
    $print = "html";
}

$context = ($_SESSION['ct'] == 'on') ? 1 : 0;

$example = $_SESSION['example'];
$treebank = $_SESSION['treebank'];
$component = $_SESSION['subtreebank'];

if ($treebank == 'sonar') {
    $includes = $_SESSION['includes'];
    $bf = $_SESSION['bf'];
}

$xpath = $_SESSION['xpath'];

session_write_close();

require "$scripts/BaseXClient.php";
require "$scripts/TreebankSearch.php";
require "$scripts/FormatResults.php";

try {
  // print results
  if ($print == "txt") {
    header("Content-type:text/plain; charset=utf-8");

    if ($treebank == 'sonar') {
        $dbhost = $dbnameServerSonar[$component[0]];
        $session = new Session($dbhost, $dbportSonar, $dbuserSonar, $dbpwdSonar);
        list($sentences, $idlist, $beginlist) = GetSentencesSonar($xpath, $treebank,
          $component, $includes, $context, array(0 , 'all'), $session);
    }
    else {
        $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
        list($sentences, $idlist, $beginlist) = GetSentences($xpath, $treebank,
          $component, $context, array(0 , 'all'), $session);
    }

    $session->close();
    array_filter($sentences);

    echo "$xpath\n";
    printMatchesTxt($sentences, $beginlist);
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

?>
