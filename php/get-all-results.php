<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require '../config/config.php';

session_start();
header('Content-Type:text/html; charset=utf-8');

/********************/
/* SET UP VARIABLES */
/********************/

$example = $_SESSION['example'];
$treebank = $_SESSION['treebank'];
$component = $_SESSION['subtreebank'];
$componentString = implode('-', $component);

// if ($treebank != "sonar") $originalXp = $_SESSION['original-xp'];
$sm = $_SESSION['search'];
$xpath = $_SESSION['xpath'];
if ($sm == "advanced" && $treebank != "sonar") {
    $xpChanged = $_SESSION['xpChanged'];
    $originalXp = $_SESSION['originalXp'];
}
$context = ($_SESSION['ct'] == 'on') ? 1 : 0;

$id = session_id();
$date = date('d-m-Y');
$time = time();

$user = (getenv('REMOTE_ADDR')) ? getenv('REMOTE_ADDR') : 'anonymous';

// messages and documentation
$showtree = "$home/scripts/ShowTree.php"; // script for displaying syntax trees

/*************/
/* LOG TREE */
/************/
// log XPath. Was XPath changed by the user or not?
$xplog = fopen("$log/gretel-ebq.log", 'a');
if ($sm == "advanced" && $treebank != "sonar") {
  // fwrite($xplog, "Date\tIP.address\tUnique.ID\tInput.example\tSearch.mode\tTreebank\tComponent\tXPath.changed\tXPath.searched\tOriginal.xpath\n");
    fwrite($xplog, "$date\t$user\t$id-$time\t$example\t$sm\t$treebank\t$componentString\t$xpChanged\t$xpath\t$originalXp\n");
}
else {
  // fwrite($xplog, "Date\tIP.address\tUnique.ID\tInput.example\tSearch.mode\tTreebank\tComponent\tXPath.searched\n");
    fwrite($xplog, "$date\t$user\t$id-$time\t$example\t$sm\t$treebank\t$componentString\t$xpath\n");
}
fclose($xplog);

require "$scripts/BaseXClient.php";
// functions to find treebank data in BaseX database and print them
require "$scripts/TreebankSearch.php";
// functions to format the treebank results
require "$scripts/FormatResults.php";

/**********************/
/* QUERY LASSY OR CGN */
/**********************/
if ($treebank == 'lassy' || $treebank == 'cgn') {
  try {

    // get sentences, search for ALL sentences
    list($sentences, $idlist, $beginlist) = GetSentences($xpath, $treebank, $component, $context, array(0 , 'all'));

    if (isset($sentences)) {
      array_filter($sentences);

      foreach ($sentences as $sid => $sentence) {
          // highlight sentence
          $hlsentence = HighlightSentence($sentence, $beginlist[$sid], 'strong');
          // deal with quotes/apos
          $trans = array('"' => '&quot;', "'" => "&apos;");
          $hlsentence = strtr($hlsentence, $trans);

          // remove the added identifier (see GetSentences) to use in the link
          $sidString = strstr($sid, '-dbIter=', true) ?: $sid;
          $sentenceidlink = '<a class="tv-show-fs" href="'.$showtree.'?sid='.$sidString.'&id='.$idlist[$sid].'&tb='.$treebank.'&opt=tv-xml" target="_blank">'.$sidString.'</a>';

          $resultsArray{$sid} = array($sentenceidlink, $hlsentence);
      }
        $results = array(
          'error' => false,
          'error_msg' => '',
          'data' => $resultsArray,
        );
        echo json_encode($results);
      }
      else {
        $results = array(
          'error' => false,
          'error_msg' => '',
          'data' => '',
        );
        echo json_encode($results);
      }
  } catch (Exception $e) {
    $results = array(
      'error' => true,
      'error_msg' => $e->getMessage(),
      'data' => '',
    );
    echo json_encode($results);
  }
}
/***************/
/* QUERY SONAR */
/***************/
elseif ($treebank == 'sonar') {
  try {
    // remove first slash
    $xpath = substr($xpath, 1);
    // XPath2BreathFirst
    $bf = `perl $scripts/Alpino2BF.pl "$tmp/$id-sub-style.xml"`;
    $basexdb = $component.$bf;

    $encodedResults = `perl $scripts/QuerySonar.pl $xpath $basexdb $resultlimit array(0, 'all')`;

    $results = json_decode($encodedResults, true);

    array_filter($results);

    foreach ($results as $sid => $match) {
      $match = explode("\t", $match);
      list($matchsent, $counthits, $db, $idlist, $beginlist) = $match;

      // highlight sentence
      $hlsentence = HighlightSentence($sentence, $beginlist[$sid]);
      // deal with quotes/apos
      $trans = array('"' => '&quot;', "'" => "&apos;");
      $hlsentence = strtr($hlsentence, $trans);

      $sentenceidlink = '<a class="tv-show-fs" href="'.$showtree.'?sid='.$sid.'&id='.$idlist[$sid].'&tb='.$treebank.'&db='.$compString.'&opt=tv-xml" target="_blank" >'.$sid.'</a>';

      $resultsArray{$sid} = array($sentenceidlink, $hlsentence, $counthits[$sid]);
    }

    $results = array(
      'error' => false,
      'error_msg' => '',
      'data' => $resultsArray,
    );
    echo json_encode($results);
  } catch (Exception $e) {
    $results = array(
      'error' => true,
      'error_msg' => $e->getMessage(),
      'data' => '',
    );
    echo json_encode($results);
  }
}
