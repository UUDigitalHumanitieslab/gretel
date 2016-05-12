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

$bf = ($treebank == 'sonar') ? $_SESSION['bf'] : false;

$counts = GetCounts($xpath, $treebank, $component, $bf);

echo $counts;
