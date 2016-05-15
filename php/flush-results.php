<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
require '../config/config.php';

session_start();

/********************/
/* SET UP VARIABLES */
/********************/
$queryIteration = $_SESSION['queryIteration'];
$leftOvers = $_SESSION['leftOvers'];

$treebank = $_SESSION['treebank'];
$component = $_SESSION['subtreebank'];

if ($treebank == 'sonar') {
    $includes = $_SESSION['includes'];
    $bf = $_SESSION['bf'];
}

$databaseString = $treebank;

$sm = $_SESSION['search'];
$example = $_SESSION['example'];
$xpath = $_SESSION['xpath'];
$context = ($_SESSION['ct'] == 'on') ? 1 : 0;

$id = session_id();

// messages and documentation
$showtree = "$home/scripts/ShowTree.php"; // script for displaying syntax trees

require "$scripts/BaseXClient.php";
// functions to find treebank data in BaseX database and print them
require "$scripts/TreebankSearch.php";
// functions to format the treebank results
require "$scripts/FormatResults.php";


try {
    if ($treebank == 'sonar') {
        $dbhost = $dbnameServerSonar{$component[0]};
        $session = new Session($dbhost, $dbportSonar, $dbuserSonar, $dbpwdSonar);
        list($sentences, $tblist, $idlist, $beginlist) = GetSentencesSonar($xpath, $treebank, $component, $includes, $context, $queryIteration, $session);
    }
    else {
        $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
        list($sentences, $idlist, $beginlist) = GetSentences($xpath, $treebank, $component, $context, $queryIteration, $session);
    }
    $session->close();
    session_write_close();

  if (isset($sentences)) {
    array_filter($sentences);
    array_filter($beginlist);
    array_filter($idlist);

    foreach ($sentences as $sid => $sentence) {
        // highlight sentence
        $hlsentence = HighlightSentence($sentence, $beginlist[$sid], 'strong');
        // deal with quotes/apos
        $trans = array('"' => '&quot;', "'" => "&apos;");
        $hlsentence = strtr($hlsentence, $trans);

        if ($treebank == 'sonar') $databaseString = $tblist[$sid];

        // remove the added identifier (see GetSentences) to use in the link
        $sidString = strstr($sid, '-dbIter=', true) ?: $sid;

        $sentenceidlink = '<a class="tv-show-fs" href="'.$showtree.
          '?sid='.$sidString.
          '&tb='.$treebank.
          '&db='.$databaseString.
          '&id='.$idlist[$sid].
          '&opt=tv-xml" target="_blank">'.$sidString.'</a>';

        $resultsArray{$sid} = array($sentenceidlink, $hlsentence);
    }
    $results = array(
      'error' => false,
      'data' => $resultsArray,
    );
    echo json_encode($results);
  }
  else {
    $results = array(
      'error' => false,
      'data' => '',
    );
    echo json_encode($results);
  }
} catch (Exception $e) {
  session_write_close();
    $results = array(
      'error' => true,
      'data' => $e->getMessage(),
    );
    echo json_encode($results);
}
