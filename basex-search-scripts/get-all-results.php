<?php
require '../config/config.php';

session_start();
set_time_limit(0);

$treebank = $_SESSION['treebank'];
$component = $_SESSION['subtreebank'];
$componentString = implode('-', $component);

if ($treebank == 'sonar') {
    $includes = $_SESSION['includes'];
    $bf = $_SESSION['bf'];
}

$databaseString = $treebank;

$xpath = $_SESSION['xpath'];
$ebsxps = $_SESSION['ebsxps'];
if ($ebsxps == 'ebs') {
    $example = $_SESSION['example'];
    if ($treebank != "sonar") {
        $xpChanged = $_SESSION['xpChanged'];
        $originalXp = $_SESSION['originalXp'];
    }
}

// get context option
$context = $_SESSION['ct'];

session_write_close();

$id = session_id();
$date = date('d-m-Y');
$time = time();

$user = (getenv('REMOTE_ADDR')) ? getenv('REMOTE_ADDR') : 'anonymous';

if ($ebsxps == 'ebs') {
    $xplog = fopen("$log/gretel-ebq.log", 'a');
    if ($treebank != "sonar") {
      // fwrite($xplog, "Date\tIP.address\tUnique.ID\tInput.example\tTreebank\tComponent\tXPath.changed\tXPath.searched\tOriginal.xpath\n");
      fwrite($xplog, "$date\t$user\t$id-$time\t$example\t$treebank\t$componentString\t$xpChanged\t$xpath\t$originalXp\n");
    }
    else {
        // fwrite($xplog, "Date\tIP.address\tUnique.ID\tInput.example\tTreebank\tComponent\tXPath.searched\n");
        fwrite($xplog, "$date\t$user\t$id-$time\t$example\t$treebank\t$componentString\t$xpath\n");
    }
    fclose($xplog);
}
else {
    $xplog = fopen("$log/gretel-xps.log", 'a');
    fwrite($xplog, "$date\t$user\t$id-$time\t$treebank\t$componentString\t$xpath\n");
    fclose($xplog);
}

require "$root/basex-search-scripts/basex-client.php";
require "$scripts/treebank-search.php";

  try {
      if ($treebank == 'sonar') {
          $dbhost = $dbnameServerSonar[$component[0]];
          $session = new Session($dbhost, $dbportSonar, $dbuserSonar, $dbpwdSonar);
          list($sentences, $tblist, $idlist, $beginlist) = getSentencesSonar($xpath, $treebank, $component, $includes, $context, array(0 , 'all'), $session);
      }
      else {
          $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
          list($sentences, $idlist, $beginlist) = getSentences($xpath, $treebank, $component, $context, array(0 , 'all'), $session);
      }
      $session->close();

    if (isset($sentences)) {
      array_filter($sentences);
      // Write results to file so that they can be downloaded later on
      // If the file already exists, remove it and re-create it (just to be sure)
      $fileName = "$tmp/$id-gretel-results.txt";
      if (file_exists($fileName)) {
          unlink($fileName);
      }

      $fh = fopen($fileName, 'a');
      fwrite($fh, "$xpath\n");

      foreach ($sentences as $sid => $sentence) {
          // highlight sentence
          $hlsentence = highlightSentence($sentence, $beginlist[$sid], 'strong');

          $changeTags = array('<em>' => '', '</em>' => '', '<strong>' => '<hit>', '</strong>' => '</hit>');
          $hlsentenceDownload = strtr($hlsentence, $changeTags);

          // deal with quotes/apos
          $transformQuotes = array('"' => '&quot;', "'" => "&apos;");
          $hlsentence = strtr($hlsentence, $transformQuotes);


          // E.g. WRPEC0000019treebank
          if ($treebank == 'sonar') $databaseString = $tblist[$sid];

          // remove the added identifier (see GetSentences) to use in the link
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

          // For Lassy and CGN tb and db are identical (i.e. lassy & lassy, or cgn & cgn).
          // For Sonar tb is sonar, and db something like WRPEC0000019treebank
          $sentenceidlink = '<a class="tv-show-fs" href="front-end-includes/show-tree.php'.
            '?sid='.$sidString.
            '&tb='.$treebank.
            '&db='.$databaseString.
            '&id='.$idlist[$sid].
            '" target="_blank">'.$sidString.'</a>';

          $resultsArray{$sid} = array($sentenceidlink, $hlsentence, $componentString);

          fwrite($fh, "$treebank\t$componentString\t$hlsentenceDownload\n");
      }
      fclose($fh);

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
