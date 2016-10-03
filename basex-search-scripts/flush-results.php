<?php
require '../config/config.php';

session_start();
set_time_limit(0);

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
$xpath = $_SESSION['xpath'];

// get context option
$context = $_SESSION['ct'];

session_write_close();

require "$root/basex-search-scripts/basex-client.php";
require "$root/basex-search-scripts/treebank-search.php";

try {
    if ($treebank == 'sonar') {
        $dbhost = $dbnameServerSonar{$component[0]};
        $session = new Session($dbhost, $dbportSonar, $dbuserSonar, $dbpwdSonar);
        list($sentences, $tblist, $idlist, $beginlist) = getSentencesSonar($xpath, $treebank, $component, $includes, $context, $queryIteration, $session);
    }
    else {
        $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
        list($sentences, $idlist, $beginlist) = getSentences($xpath, $treebank, $component, $context, $queryIteration, $session);
    }
    $session->close();

  if (isset($sentences)) {
    array_filter($sentences);
    array_filter($beginlist);
    array_filter($idlist);

    foreach ($sentences as $sid => $sentence) {
        // highlight sentence
        $hlsentence = highlightSentence($sentence, $beginlist[$sid], 'strong');
        // deal with quotes/apos
        $trans = array('"' => '&quot;', "'" => "&apos;");
        $hlsentence = strtr($hlsentence, $trans);

        if ($treebank == 'sonar') $databaseString = $tblist[$sid];

        // remove the added identifier (see getSentences) to use in the link
        $sidString = strstr($sid, '-dbIter=', true) ?: $sid;

        // subtreebank where the sentence was found:
        if ($treebank == "lassy") {
            preg_match('/([^<>]+?)(?:-\d+(?:-|\.).*)/', $sidString, $component);
            $component = preg_replace('/^((?:[a-zA-Z]{3,4})|(?:WR(?:-[a-zA-Z]){3}))-.*/', '$1', $component[1]);

            $componentString = str_replace('-', '', $component);
            $componentString = substr($componentString, 0, 4);
        } else if ($treebank == "cgn") {
            preg_match('/([^<>\d]+)/', $sidString, $component);
            $component = substr($component[1], 1);

            $componentString = str_replace('-', '', $component);
        } else {
            preg_match('/^([a-zA-Z]{2}(?:-[a-zA-Z]){3})/', $sidString, $component);
            $componentString = str_replace('-', '', $component[1]);
        }

        $componentString = strtoupper($componentString);

        $sentenceidlink = '<a class="tv-show-fs" href="front-end-includes/show-tree.php'.
          '?sid='.$sidString.
          '&tb='.$treebank.
          '&db='.$databaseString.
          '&id='.$idlist[$sid].
          '" target="_blank">'.$sidString.'</a>';

          $resultsArray{$sid} = array($sentenceidlink, $hlsentence, $componentString);
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
    $results = array(
      'error' => true,
      'data' => $e->getMessage(),
    );
    echo json_encode($results);
}
