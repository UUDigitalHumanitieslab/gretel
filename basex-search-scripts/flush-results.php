<?php

header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

require '../config/config.php';
require "$root/functions.php";

require "$root/basex-search-scripts/basex-client.php";
require "$root/basex-search-scripts/treebank-search.php";

session_start();
set_time_limit(0);

$queryIteration = $_SESSION['endPosIteration'];

$corpus = $_SESSION['treebank'];
$components = $_SESSION['subtreebank'];
$databases = $_SESSION['flushDatabases'];
$already = $_SESSION['flushAlready'];
if ($corpus == 'sonar') {
    $needRegularSonar = $_SESSION['needRegularSonar'];
}

$databaseString = $corpus;
$xpath = $_SESSION['xpath'];

// get context option
$context = $_SESSION['ct'];

session_write_close();

try {
    if ($corpus == 'sonar') {
        $serverInfo = getServerInfo($corpus, $components[0]);
    } else {
        $serverInfo = getServerInfo($corpus, false);
    }

    $dbhost = $serverInfo{'machine'};
    $dbport = $serverInfo{'port'};
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

    list($sentences, $tblist, $idlist, $beginlist) = getSentences($databases, $already, $queryIteration, $session);
    $session->close();

    if (isset($sentences)) {
        foreach ($sentences as $sid => $sentence) {
            // highlight sentence
            $hlsentence = highlightSentence($sentence, $beginlist[$sid], 'strong');
            // deal with quotes/apos
            $trans = array('"' => '&quot;', "'" => '&apos;');
            $hlsentence = strtr($hlsentence, $trans);

            if ($corpus == 'sonar') {
                $databaseString = $tblist[$sid];
            }

            // remove the added identifier (see getSentences) to use in the link
            $sidString = strstr($sid, '-endPos=', true) ?: $sid;

            // subtreebank where the sentence was found:
            if ($corpus == 'lassy') {
                preg_match('/([^<>]+?)(?:-\d+(?:-|\.).*)/', $sidString, $componentFromRegex);
                $componentFromRegex = preg_replace('/^((?:[a-zA-Z]{3,4})|(?:WR(?:-[a-zA-Z]){3}))-.*/', '$1', $componentFromRegex[1]);

                $componentString = str_replace('-', '', $componentFromRegex);
                $componentString = substr($componentString, 0, 4);
            } elseif ($corpus == 'cgn') {
                preg_match('/([^<>\d]+)/', $sidString, $componentFromRegex);
                $componentFromRegex = substr($componentFromRegex[1], 1);

                $componentString = str_replace('-', '', $componentFromRegex);
            } else {
                preg_match('/^([a-zA-Z]{2}(?:-[a-zA-Z]){3})/', $sidString, $componentFromRegex);
                $componentString = str_replace('-', '', $componentFromRegex[1]);
            }

            $componentString = strtoupper($componentString);

            $sentenceidlink = '<a class="tv-show-fs" href="front-end-includes/show-tree.php'
            . '?sid='.$sidString
            . '&tb='.$corpus
            . '&db='.$databaseString
            . '&id='.$idlist[$sid]
            . '" target="_blank">'.$sidString.'</a>';

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
