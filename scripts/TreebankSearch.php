<?php
function GetCounts($xpath,$treebank,$subtreebanks,$session) {
  $database=Corpus2DB($subtreebanks,$treebank); // rename corpora to database names
  $TOTAL=SetTotalSent($treebank);
  
  foreach ($database as $db) {
    
    // count matches
    $xqhits= CreateXQueryCount($xpath,$db,"hits");
    $queryhits = $session->query($xqhits);
    $cnthits=$queryhits->execute();
    
    $HITS{$db}=$cnthits;
    
    // count matching sentences
    $xqms= CreateXQueryCount($xpath,$db,"ms");
    $queryms = $session->query($xqms);
    $cntms=$queryms->execute();
    
    $MS{$db}=$cntms;
    
    $TOTALS{$db}=$TOTAL{$db}; // store total sentences of selected databases
  }
  
  $queryhits->close();
  $queryms->close();
  
  // total counts
      
  $TOTALCOUNTS{'hits'}=array_sum($HITS); // count total matches
  $TOTALCOUNTS{'ms'}=array_sum($MS); // count total matching sentences 
  $TOTALCOUNTS{'totals'}=array_sum($TOTALS); // count total sentences in corpus
  
  return array($HITS,$MS,$TOTALS,$TOTALCOUNTS);
  }

function Corpus2DB($tblist,$treebank) {
  // rename corpora to database names
  $databases=array();

  if ($treebank) {
    foreach ($tblist as $tb) {
      $treebank=strtoupper($treebank);
      $tb=strtoupper($tb);
      $tb=$treebank."_ID_".$tb;
      array_push($databases, "$tb");
    }
    return $databases;
  }
}

function SetTotalSent($corpus) {
  if ($corpus == 'lassy') {
    $TOTAL['LASSY_ID_DPC']="11716";
    $TOTAL['LASSY_ID_WIKI']="7341";
    $TOTAL['LASSY_ID_WRPE']="14420";
    $TOTAL['LASSY_ID_WRPP']="17691";
    $TOTAL['LASSY_ID_WSU']="14032";
    $TOTAL['TOTAL']="65200";
  } 
  
  elseif ($corpus == 'cgn') {
    $TOTAL['CGN_ID_NA']="50239";
    $TOTAL['CGN_ID_NB']="2484";
    $TOTAL['CGN_ID_NC']="11649";
    $TOTAL['CGN_ID_NE']="3123";
    $TOTAL['CGN_ID_NF']="6290";
    $TOTAL['CGN_ID_NG']="1166";
    $TOTAL['CGN_ID_NH']="3064";
    $TOTAL['CGN_ID_NI']="2251";
    $TOTAL['CGN_ID_NJ']="2259";
    $TOTAL['CGN_ID_NK']="1923";
    $TOTAL['CGN_ID_NL']="1857";
    $TOTAL['CGN_ID_NM']="444";
    $TOTAL['CGN_ID_NN']="593";
    $TOTAL['CGN_ID_VA']="22881";
    $TOTAL['CGN_ID_VB']="4289";
    $TOTAL['CGN_ID_VC']="3142";
    $TOTAL['CGN_ID_VD']="929";
    $TOTAL['CGN_ID_VF']="2617";
    $TOTAL['CGN_ID_VG']="543";
    $TOTAL['CGN_ID_VH']="1395";
    $TOTAL['CGN_ID_VI']="1026";
    $TOTAL['CGN_ID_VJ']="536";
    $TOTAL['CGN_ID_VK']="558";
    $TOTAL['CGN_ID_VL']="601";
    $TOTAL['CGN_ID_VM']="107";
    $TOTAL['CGN_ID_VN']="701";
    $TOTAL['CGN_ID_VO']="3256";
    $TOTAL['TOTAL']="129923";
  }
  
 
  else {
    return ("ERROR!");
  }
  return ($TOTAL);
}

function CreateXQueryCount($xpath,$db,$flag) { // create XQuery instance 
  if ($flag == 'hits') { // count hits
    $for= 'count(for $node in db:open("'.$db.'")/treebank';
    
    $return='return $node)';
    
    $xquery = $for.$xpath.$return; 

    return $xquery;
  }

  elseif ($flag == 'ms') { // count matching sentences
    $for = 'count(for $node in db:open("'.$db.'")';
    $filter = '/ancestor::*[sentence]/sentence '; // space after $filter !

    $return = 'return $node)';

    $xquery = $for.$xpath.$filter.$return;

    return $xquery;
  }
}


function GetSentences($xpath,$treebank,$subtreebanks,$session,$limit,$context) {
  $database=Corpus2DB($subtreebanks,$treebank); // rename corpora to database names
   
    foreach ($database as $db) {
      
      // create XQuery
      if ($limit == "none") {
	$input = CreateXQuery($xpath,$db,$treebank,$context);
      }
      
      else {
	$input = CreateXQueryLimit($xpath,$db,$limit,$treebank,$context);
      }

      $query = $session->query($input); // create query instance 

      // get results
      $match=$query->execute();
    
      $matches = preg_split('/(<\/match>)/', $match); // put matches into array
      $matches = array_filter($matches); // remove empty elements from array
    
      foreach ($matches as $m) { // make a hash of all matching sentences, count hits per sentence and append matching IDs per sentence
	$m=preg_replace('/<match>/','', $m);
	list($sentid,$sentence,$ids,$begins) = explode('||', $m);
	if (!isset($counthits{$sentid})) {
	  $counthits{$sentid}=0;
	}
	$counthits{$sentid}++;
	
	$sentences{$sentid}=$sentence;
	if (isset($idlist{$sentid})) {
	  $idlist{$sentid}.='-'.$ids;
	}
	else {
	  $idlist{$sentid}=$ids;
	}

	if (isset($beginlist{$sentid})) {
	  $beginlist{$sentid}.='-'.$begins;
	}
	else {
	  $beginlist{$sentid}=$begins;
	}
	
      }
    
      $query->close(); // close query instance
    }
    
    if (isset($sentences)) {
      return array($sentences,$counthits,$idlist,$beginlist);
    }

    else {
      return "undef"; // in case there are no results found
    }
}


function CreateXQuery($xpath,$db,$tb,$context) { // create XQuery instance 
    $for= 'for $node in db:open("'.$db.'")/treebank';
    $sentid='let $sentid := ($node/ancestor::alpino_ds/@id)';
    $sentence='let $sentence := ($node/ancestor::alpino_ds/sentence)';
    $ids='let $ids := ($node//@id)';
    $begins='let $begins := ($node//@begin)';
    
    if ($context!=0) {
      $tb=strtoupper($tb);
      $dbs=$tb.'_ID_S';

      $text='let $text := fn:replace($sentid[1], \'(.+)(\d+)\', \'$1\')';
      $snr='let $snr := fn:replace($sentid[1], \'(.+)(\d+)\', \'$2\')';
      $prev='let $prev := (number($snr)-1)';
      $next='let $next := (number($snr)+1)';
      $previd='let $previd := concat($text, $prev)';
      $nextid='let $nextid := concat($text, $next)';

      $prevs='let $prevs := (db:open("'.$dbs.'")//s[id=$previd]/sentence)';
      $nexts='let $nexts := (db:open("'.$dbs.'")//s[id=$nextid]/sentence)';
      
      $return='return <match>{data($sentid)}||{data($prevs)}<i>{data($sentence)}</i>{data($nexts)}||{string-join($ids, \'-\')}||{string-join($begins, \'-\')}</match>';
      $xquery = $for.$xpath.$sentid.$sentence.$ids.$begins.$text.$snr.$prev.$next.$previd.$nextid.$prevs.$nexts.$return;
    }
    
    else {
      $return='return <match>{data($sentid)}||{data($sentence)}||{string-join($ids, \'-\')}||{string-join($begins, \'-\')}</match>';
      $xquery = $for.$xpath.$sentid.$sentence.$ids.$begins.$return;
    }
    return $xquery;
}

function CreateXQueryLimit($xpath,$db,$lim,$tb,$context) { // create XQuery instance 
    $limit='for $node in subsequence(db:open("'.$db.'")'.$xpath.',1, '.$lim.')';
    $sentid='let $sentid := ($node/ancestor::alpino_ds/@id)';
    $sentence='let $sentence := ($node/ancestor::alpino_ds/sentence)';
    $ids='let $ids := ($node//@id)';
    $begins='let $begins := ($node//@begin)';
    
    if ($context!=0) {
      $tb=strtoupper($tb);
      $dbs=$tb.'_ID_S';

      $text='let $text := fn:replace($sentid[1], \'(.+)(\d+)\', \'$1\')';
      $snr='let $snr := fn:replace($sentid[1], \'(.+)(\d+)\', \'$2\')';
      $prev='let $prev := (number($snr)-1)';
      $next='let $next := (number($snr)+1)';
      $previd='let $previd := concat($text, $prev)';
      $nextid='let $nextid := concat($text, $next)';

      $prevs='let $prevs := (db:open("'.$dbs.'")//s[id=$previd]/sentence)';
      $nexts='let $nexts := (db:open("'.$dbs.'")//s[id=$nextid]/sentence)';
      
      $return='return <match>{data($sentid)}||{data($prevs)}<i>{data($sentence)}</i>{data($nexts)}||{string-join($ids, \'-\')}||{string-join($begins, \'-\')}</match>';
      $xquery = $limit.$sentid.$sentence.$ids.$begins.$text.$snr.$prev.$next.$previd.$nextid.$prevs.$nexts.$return;
    }
    
    else {
      $return='return <match>{data($sentid)}||{data($sentence)}||{string-join($ids, \'-\')}||{string-join($begins, \'-\')}</match>';
      $xquery = $limit.$sentid.$sentence.$ids.$begins.$return;
    }
    return $xquery;
}

function SetDB2Corpus($corpus) {
  if ($corpus == 'lassy') {
  $CORPUS['LASSY_ID_DPC']='DPC';
  $CORPUS['LASSY_ID_WIKI']='Wikipedia';
  $CORPUS['LASSY_ID_WRPE']='WR-P-E';
  $CORPUS['LASSY_ID_WRPP']='WR-P-P';
  $CORPUS['LASSY_ID_WSU']='WS-U';
  } 
 
  elseif ($corpus == 'cgn') {
    $CORPUS['CGN_ID_NA']="NA";
    $CORPUS['CGN_ID_NB']="NB";
    $CORPUS['CGN_ID_NC']="NC";
    $CORPUS['CGN_ID_NE']="NE";
    $CORPUS['CGN_ID_NF']="NF";
    $CORPUS['CGN_ID_NG']="NG";
    $CORPUS['CGN_ID_NH']="NH";
    $CORPUS['CGN_ID_NI']="NI";
    $CORPUS['CGN_ID_NJ']="NJ";
    $CORPUS['CGN_ID_NK']="NK";
    $CORPUS['CGN_ID_NL']="NL";
    $CORPUS['CGN_ID_NM']="NM";
    $CORPUS['CGN_ID_NN']="NN";
    $CORPUS['CGN_ID_VA']="VA";
    $CORPUS['CGN_ID_VB']="VB";
    $CORPUS['CGN_ID_VC']="VC";
    $CORPUS['CGN_ID_VD']="VD";
    $CORPUS['CGN_ID_VF']="VF";
    $CORPUS['CGN_ID_VG']="VG";
    $CORPUS['CGN_ID_VH']="VH";
    $CORPUS['CGN_ID_VI']="VI";
    $CORPUS['CGN_ID_VJ']="VJ";
    $CORPUS['CGN_ID_VK']="VK";
    $CORPUS['CGN_ID_VL']="VL";
    $CORPUS['CGN_ID_VM']="VM";
    $CORPUS['CGN_ID_VN']="VN";
    $CORPUS['CGN_ID_VO']="VO";
  }
  
  elseif ($corpus == 'sonar') {
    $CORPUS['SONAR_ID_WRPEA_1']="WRPEA_1";
    $CORPUS['SONAR_ID_WRPEA_2']="WRPEA_2";
  }
  
  else {
    return ("ERROR!");
  }

  return ($CORPUS);
}


function SetDB2CorpusDetailed($corpus) {
  if ($corpus == 'lassy') {
  $CORPUS['LASSY_ID_DPC']='<a href="#" class="hovertip">DPC<span>Dutch Parallel Corpus</span></a>';
  $CORPUS['LASSY_ID_WIKI']='<a href="#" class="hovertip">Wikipedia<span>Dutch Wikipedia pages</span></a>';
  $CORPUS['LASSY_ID_WRPE']='<a href="#" class="hovertip">WR-P-E<span>E-magazines, newsletters, teletext pages, web sites, Wikipedia</span></a>';
  $CORPUS['LASSY_ID_WRPP']='<a href="#" class="hovertip">WR-P-P<span>Books, brochures, guides and manuals, legal texts, newspapers, periodicals and magazines, policy documents, proceedings, reports, surveys</span></a>';
  $CORPUS['LASSY_ID_WSU']='<a href="#" class="hovertip">WS-U<span>Auto cues, news scripts, texts for the visually impaired</span></a>';
  } 
 
  elseif ($corpus == 'cgn') {
    $CORPUS['CGN_ID_NA']='<a href="#" class="hovertip">NA<span>Spontaneous conversations (\'face-to-face\')</span></a>';
    $CORPUS['CGN_ID_NB']='<a href="#" class="hovertip">NB<span>Interviews with teachers of Dutch</span></a>';
    $CORPUS['CGN_ID_NC']='<a href="#" class="hovertip">NC<span>Telephone conversations (recorded via a switchboard)</span></a>';
    $CORPUS['CGN_ID_NE']='<a href="#" class="hovertip">NE<span>Simulated business negotiations</span></a>';
    $CORPUS['CGN_ID_NF']='<a href="#" class="hovertip">NF<span>Interviews/discussions/debates (broadcast)</span></a>';
    $CORPUS['CGN_ID_NG']='<a href="#" class="hovertip">NG<span>(Political) discussions/debates/meetings (non-broadcast)</span></a>';
    $CORPUS['CGN_ID_NH']='<a href="#" class="hovertip">NH<span>Lessons recorded in the classroom</span></a>';
    $CORPUS['CGN_ID_NI']='<a href="#" class="hovertip">NI<span>Live (sports) commentaries (broadcast)</span></a>';
    $CORPUS['CGN_ID_NJ']='<a href="#" class="hovertip">NJ<span>Newsreports (broadcast)</span></a>';
    $CORPUS['CGN_ID_NK']='<a href="#" class="hovertip">NK<span>News (broadcast)</span></a>';
    $CORPUS['CGN_ID_NL']='<a href="#" class="hovertip">NL<span>Commentaries/columns/reviews (broadcast)</span></a>';
    $CORPUS['CGN_ID_NM']='<a href="#" class="hovertip">NM<span>Ceremonious speeches/sermons</span></a>';
    $CORPUS['CGN_ID_NN']='<a href="#" class="hovertip">NN<span>Lectures/seminars</span></a>';
    $CORPUS['CGN_ID_VA']='<a href="#" class="hovertip">VA<span>Spontaneous conversations (\'face-to-face\')</span></a>';
    $CORPUS['CGN_ID_VB']='<a href="#" class="hovertip">VB<span>Interviews with teachers of Dutch</span></a>';
    $CORPUS['CGN_ID_VC']='<a href="#" class="hovertip">VC<span>Telephone conversations (recorded via a switchboard)</span></a>';
    $CORPUS['CGN_ID_VD']='<a href="#" class="hovertip">VD<span>Telephone conversations (recorded on MD)</span></a>';
    $CORPUS['CGN_ID_VF']='<a href="#" class="hovertip">VF<span>Interviews/discussions/debates (broadcast)</span></a>';
    $CORPUS['CGN_ID_VG']='<a href="#" class="hovertip">VG<span>(Political) discussions/debates/meetings (non-broadcast)</span></a>';
    $CORPUS['CGN_ID_VH']='<a href="#" class="hovertip">VH<span>Lessons recorded in the classroom</span></a>';
    $CORPUS['CGN_ID_VI']='<a href="#" class="hovertip">VI<span>Live (sports) commentaries (broadcast)</span></a>';
    $CORPUS['CGN_ID_VJ']='<a href="#" class="hovertip">VJ<span>Newsreports (broadcast)</span></a>';
    $CORPUS['CGN_ID_VK']='<a href="#" class="hovertip">VK<span>News (broadcast)</span></a>';
    $CORPUS['CGN_ID_VL']='<a href="#" class="hovertip">VL<span>Commentaries/columns/reviews (broadcast)</span></a>';
    $CORPUS['CGN_ID_VM']='<a href="#" class="hovertip">VM<span>Ceremonious speeches/sermons</span></a>';
    $CORPUS['CGN_ID_VN']='<a href="#" class="hovertip">VN<span>Lectures/seminars</span></a>';
    $CORPUS['CGN_ID_VO']='<a href="#" class="hovertip">VO<span>Read speech</span></a>';
  }
  
  elseif ($corpus == 'sonar') {
    $CORPUS['SONAR_ID_WRPEA_1']="WRPEA_1";
    $CORPUS['SONAR_ID_WRPEA_2']="WRPEA_2";
  }
  
  else {
    return ("ERROR!");
  }
  
  return ($CORPUS);
}

?>