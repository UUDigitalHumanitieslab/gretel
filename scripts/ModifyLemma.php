<?php
function ModifyLemma($parse,$id,$tmp){
  $input=fopen("$parse", "r");
  $output=fopen("$tmp/$id-pt.xml", "w");
  $xml = simpledom_load_file("$parse"); //read alpino parse

  $pts = $xml->sortedXPath('//node[@begin and @postag]', '@begin'); //sort terminal nodes by 'begin' attribute

  $i=0;
  foreach ($pts as $pt) {
    if ($pt!=="let") {
      $lemma=$pts[$i]->getAttribute("lemma");
      $newlemma=preg_replace('/_DIM/',"",$lemma); // remove _DIM from lemmas (for diminutives)
      $newlemma=preg_replace('/_/',"",$newlemma); // remove _ from lemmas (for compounds)
      $pts[$i]->setAttribute("lemma", "$newlemma"); // add lemma
    }
    $i++;
  }

  $tree = $xml->asXML();
  fwrite($output, "$tree");
  fclose($output);
  return "$tmp/$id-pt.xml"; //return parse location
}

?>
