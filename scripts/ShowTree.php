<?php
   /*
     ShowTree.php
     Script looks up an XML tree in a BaseX database and prints it as a syntax tree

     version 0.4 date: 14.10.2014  RELEASED WITH GrETEL2.0
     written by Liesbeth Augustinus (c) 2014
     for the GrETEL2.0 project

   */

/*********************************/

// GET VARIABLES

if (isset($_GET["sid"])) {
  $sentid=$_GET["sid"];
}
if (isset($_GET["id"])) {
  $idstring=$_GET["id"];
}
if (isset($_GET["opt"])) {
  $option=$_GET["opt"];
}
if (isset($_GET["wd"])) {
  $wstring=$_GET["wd"];
}
if (isset($_GET["tb"])) {
  $treebank=$_GET["tb"];
}
if (isset($_GET["db"])) {
  $db=$_GET["db"];
}
/*********************************/
header('Content-type: text/xml');

require("../config/config.php"); // load configuration file

// Path to external scripts
$scripts="$root/scripts"; // scripts dir
$basexclient="$scripts/BaseXClient.php";

// INCLUDE EXTERNAL SCRIPTS
require("$basexclient");

// connect to database
if(!$treebank) { // if no treebank is set
  echo "Treebank not found!</br>\n";
  exit;
}

// BaseX database variables

if ($treebank=='lassy' || $treebank=='cgn') {

  $db=strtoupper($treebank);
  $db=$db.'_ID';
  $xquery = 'db:open("'.$db.'")/treebank/alpino_ds[@id="'.$sentid.'"]'; // build XQuery

  // create session
  $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

}

else { // for sonar

  preg_match('/^([A-Z]{5})/', $db, $comp);
  $component=$comp[0];
  $dbhost2=$dbname_server[$component]; // get DBserver name

  $xquery = 'db:open("'.$db.'")/treebank/alpino_ds[@id="'.$sentid.'"]'; // build XQuery

  // create session
  $session = new Session($dbhost2, $dbport2, $dbuser2, $dbpwd2);
}

// fetch tree
$query = $session->query($xquery); // create query instance
$xml=$query->execute();

$query->close(); // close query instance
$session->close(); // close session


// deal with quotes
$trans = array("'" => '&apos;' );
$xml=strtr("$xml", $trans);

// build xpath
if(isset($idstring)) {
  $part=preg_replace('/(\d+)/','@id="$1"',$idstring);
  $xpart=str_replace('-',' or ',$part);
  $xpath="//node[$xpart]";
}

elseif(isset($wstring)) {
  $wstring=preg_replace('/^-*|-*$/','',$wstring); //remove - at beginning and/or end
  $part=preg_replace('/(\w+)/','@word="$1" or @lemma="$1"',$wstring);
  $xpart=str_replace('-',' or ',$part);
  $xpath="//node[$xpart]";
}

else {
  $xpath='//node[@rel="--"]';
}


// representation modes

if (isset($option) && $option=="xml") {
    echo $xml;
}

else {
  if (isset($option) && $option=="tv-xml") {
      $styletree=`perl  $scripts/xml2tree.pl '$xml' '$xpath' 'tv-default'`;
  }
  elseif (isset($option) && $option=="zoom") {
    $styletree=`perl  $scripts/xml2tree.pl '$xml' '$xpath' 'zsonar'`;
  }

  else {
    $styletree=`perl  $scripts/xml2tree.pl '$xml' '$xpath' 'psonar'`;
  }

  $stylexml=simplexml_load_string($styletree);
  echo $stylexml->asXML();
}

?>
