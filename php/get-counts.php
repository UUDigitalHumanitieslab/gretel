<?php
require "../config/config.php";

require "$scripts/basex-client.php";
require "$scripts/treebank-count.php";
require "$scripts/treebank-search.php";

session_start();
set_time_limit(0);

$id = session_id();

$xpath = $_SESSION['xpath'];
$treebank  = $_SESSION['treebank'];
$component = $_SESSION['subtreebank'];

$includes = ($treebank == 'sonar') ? $_SESSION['includes'] : false;

session_write_close();

if ($treebank == 'sonar') {
    $dbhost = $dbnameServerSonar{$component[0]};
    $session = new Session($dbhost, $dbportSonar, $dbuserSonar, $dbpwdSonar);
}
else {
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
}

list($sum, $counts) = getCounts($xpath, $treebank, $component, $includes, $session);

$session->close();

if ($treebank != 'sonar') {
  // Add a distribution to the list:
  // Instead of simply returning the amount of hits, return an array of
  // each database with the amounts of hits per database, and the total
  // # of sentences for that database
  $total = getTotalSentences($treebank);
  if (isset($total)) {
    foreach ($counts as $database => $dbcount) {
      $counts[$database] = array($dbcount, $total[$database]);
    }
    createCsvCounts($sum, $counts);
  }
}
echo json_encode(array($sum, $counts));
