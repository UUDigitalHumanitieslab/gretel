<?php
function Tokenize($sentence) {
  $addspace=preg_replace('/([<>\.\,\:\;\?!\(\)\"])/'," $1 " , $sentence); //add space before and after punctuation marks
  $addspace=preg_replace("/(\.\s+\.\s+\.)/",' ... ' , $addspace); // deal with ...
  $cfs=preg_replace('/^\s*(.*)/',"$1" , $addspace); //delete first space
  $cls=preg_replace('/(.*?)\s*$/',"$1" , $cfs); //delete last space
  $tinput=preg_replace('/\s+/'," " , $cls);// change multiple spaces to single space
  return $tinput;
  }
?>