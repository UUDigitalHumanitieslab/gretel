<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require '../config/config.php';
require "$root/helpers.php";

session_start();
header('Content-Type:text/html; charset=utf-8');

/********************/
/* SET UP VARIABLES */
/********************/
if (!$_SESSION['queryIteration']) {
  $_SESSION['queryIteration'] = 0;
}

$queryIteration = $_SESSION['queryIteration'];
$_SESSION['queryIteration']++;

$treebank = $_SESSION['treebank'];
// if ($treebank != "sonar") $originalXp = $_SESSION['original-xp'];
$sm = $_SESSION['search'];
$exid = $_SESSION['sentid'];
$example = $_SESSION['example'];
$xpath = $_SESSION['xpath'];
$context = ($_SESSION['ct'] == 'on') ? 1 : 0;

$id = session_id();
$date = date('d-m-Y');
$time = time();

// Clean up XPath
$xpath = rtrim($xpath);
$xpath = str_replace(array("\r", "\n", "\t"), ' ', $xpath);
// Deal with quotes/apos
$trans = array("='" => '="', "'\s" => '"\s', "']" => '"]');
$xpath = strtr("$xpath", $trans);

// Clean up $originalXp
// $originalXp = rtrim($originalXp);
// $originalXp = str_replace(array("\r", "\n", "\t"), ' ', $originalXp);
// $originalXp = strtr("$originalXp", $trans);

// $xpChanged = ($xpath == $originalXp) ? 'no' : 'yes';
$user = (getenv('REMOTE_ADDR')) ? getenv('REMOTE_ADDR') : 'anonymous';

// messages and documentation
$showtree = "$home/scripts/ShowTree.php"; // script for displaying syntax trees

/*************/
/* LOG TREE */
/************/
// log XPath. Was XPath changed by the user or not?
$xplog = fopen("$log/gretel-ebq.log", 'a');
if ($sm == "advanced" && $treebank != "sonar") {
    fwrite($xplog, "$date\t$user\t$id-$time\t$sm\t$treebank\t$xpChanged\t$xpath\t$originalXp\n");
}
else {
    fwrite($xplog, "$date\t$user\t$id-$time\t$sm\t$treebank\t$xpath\n");
}
fclose($xplog);

require "$scripts/BaseXClient.php";
// functions to find treebank data in BaseX database and print them
require "$scripts/TreebankSearch.php";
// functions to format the treebank results
require "$scripts/FormatResults.php";

/***********************/
/* SELECT SUBTREEBANKS */
/***********************/
if (is_array($_SESSION['subtb'])) {
    $subtreebanks = array_keys($_SESSION['subtb']);
    $subtreebank = implode('-', $subtreebanks);
    // get string of components
    $components = implode(', ', $subtreebanks);
} else {
    $subtreebank = $_SESSION['subtb'];
}

/**********************/
/* QUERY LASSY OR CGN */
/**********************/
if ($treebank == 'lassy' || $treebank == 'cgn') {
  try {
    // create session
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

    // get sentences
    list($sentences, $counthits, $idlist, $beginlist) = GetSentences($xpath, $treebank, $subtreebanks, $session, $context, $queryIteration);

    if (isset($sentences)) {
      array_filter($sentences);

      foreach ($sentences as $id => $sentence) {
          $sid = trim($id);
          // highlight sentence
          $hlsentence = HighlightSentence($sentence, $beginlist[$id]);
          // deal with quotes/apos
          $trans = array('"' => '&quot;', "'" => "&apos;");
          $hlsentence = strtr($hlsentence, $trans);

          $sentenceidlink = '<a class="tv-show-fs" href="'.$showtree.'?sid='.$sid.'&id='.$idlist[$id].'&tb='.$treebank.'&db='.$treebank.'&opt=tv-xml" target="_blank" >'.$sid.'</a>';

          $resultsArray{$sid} = array($sentenceidlink, $hlsentence, $counthits[$id]);
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
          'noresults' => true,
        );
        echo json_encode($results);
      }
  } catch (Exception $e) {
    $results = array(
      'error' => true,
      'error_msg' => $e,
      'data' => '',
    );
    echo json_encode($results);
  }
  $session->close();
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
    $basexdb = $subtreebank.$bf;

    $encodedResults = `perl $scripts/QuerySonar.pl $xpath $basexdb $queryIteration`;

    var_dump($encodedResults);

    $results = json_decode($encodedResults, true);

    array_filter($results);

    foreach ($results as $sid => $match) {
      $match = explode("\t", $match);
      list($matchsent, $counthits, $db, $idlist, $beginlist) = $match;

      // highlight sentence
      $hlsentence = HighlightSentence($sentence, $beginlist[$id]);
      // deal with quotes/apos
      $trans = array('"' => '&quot;', "'" => "&apos;");
      $hlsentence = strtr($hlsentence, $trans);
      $sentenceidlink = '<a class="tv-show-fs" href="'.$showtree.'?sid='.$sid.'&id='.$idlist[$id].'&tb='.$treebank.'&db='.$treebank.'&opt=tv-xml" target="_blank" >'.$sid.'</a>';

      $resultsArray{$sid} = array($sentenceidlink, $hlsentence, $counthits[$id]);
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
      'error_msg' => $e,
      'data' => '',
    );
    echo json_encode($results);
  }
  $session->close();
}
