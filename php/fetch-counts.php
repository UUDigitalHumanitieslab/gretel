<?php
//error_reporting(E_ALL);
//ini_set('display_errors', 1);
require "../config/config.php";

require "$scripts/BaseXClient.php";
require "$scripts/TreebankSearch.php";

session_start();
header('Content-Type:text/html; charset=utf-8');

$xpath = $_SESSION['xpath'];
$treebank  = $_SESSION['treebank'];
$component = $_SESSION['subtreebank'];

$includes = ($treebank == 'sonar') ? $_SESSION['includes'] : false;

if ($treebank == 'sonar') {
    $dbhost = $dbnameServerSonar{$component[0]};
    $session = new Session($dbhost, $dbportSonar, $dbuserSonar, $dbpwdSonar);
}
else {
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
}

$counts = GetCounts($xpath, $treebank, $component, $includes, $session);
$session->close();

echo $counts;
