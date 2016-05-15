<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();

$treebank = $_SESSION['treebank'];
$component = $_SESSION['subtreebank'];
$xpath = $_SESSION['xpath'];
$type = $_GET["type"];
$data = $_POST["data"];

session_write_close();

$sentTreebank = $data[0];
$sentComponent = $data[1];
$sentences = $data[2];


if (isset($data)) {
  if (!isset($type) || $type == "text") {
    header("Content-Disposition: attachment; filename=gretel-results.txt");
    header("Content-type:text/plain; charset=utf-8");

    echo $data;

    echo $xpath;
    foreach ($sentences as $sid => $sentence) {
        // Wrap each hit in a sentence in <hit> tags
        $hlsentence = HighlightSentence($sentence, $beginlist[$sid], 'hit');
        $sidString = strstr($sid, '-dbIter=', true) ?: $sid;
        echo "$sidString\t$hlsentence\n";
    }
  }
}
