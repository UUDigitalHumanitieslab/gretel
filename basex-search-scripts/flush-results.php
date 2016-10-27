<?php
require '../config/config.php';
require "$root/functions.php";

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
      $serverInfo = getServerInfo($treebank, $component[0]);
        $dbhost = $serverInfo{'machine'};
        $dbport = $serverInfo{'port'};
        $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
        list($sentences, $tblist, $idlist, $beginlist) = getSentencesSonar($xpath, $treebank, $component, $includes, $context, $queryIteration, $session);
    }
    else {
      $serverInfo = getServerInfo($treebank, false);
        $dbhost = $serverInfo{'machine'};
        $dbport = $serverInfo{'port'};
        $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
        list($sentences, $idlist, $beginlist) = getSentences($xpath, $treebank, $component, $context, $queryIteration, $session);
    }
    $session->close();

  if (isset($sentences)) {
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
            preg_match('/([^<>]+?)(?:-\d+(?:-|\.).*)/', $sidString, $componentFromRegex);
            $componentFromRegex = preg_replace('/^((?:[a-zA-Z]{3,4})|(?:WR(?:-[a-zA-Z]){3}))-.*/', '$1', $componentFromRegex[1]);

            $componentString = str_replace('-', '', $componentFromRegex);
            $componentString = substr($componentString, 0, 4);
        } else if ($treebank == "cgn") {
            preg_match('/([^<>\d]+)/', $sidString, $componentFromRegex);
            $componentFromRegex = substr($componentFromRegex[1], 1);

            $componentString = str_replace('-', '', $componentFromRegex);
        } else {
            preg_match('/^([a-zA-Z]{2}(?:-[a-zA-Z]){3})/', $sidString, $componentFromRegex);
            $componentString = str_replace('-', '', $componentFromRegex[1]);
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
  } else {
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
