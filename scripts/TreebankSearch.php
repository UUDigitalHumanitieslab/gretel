<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
/**
 *
 * $databases is actually a copy of the first breadth-first pattern. One would
 * argue that includes was a better name. However, to keep some cohesion between
 * SONAR on the one hand and CGN and Lassy on the other, we call both the includes
 * as well as the result of Corpus2DB databases
 *
 */
function GetCounts($xpath, $treebank, $subtreebank, $databases, $session)
{
    global $cats;
    if ($treebank == 'sonar') {
        $bf = $databases[0];
        if (strpos($bf, 'ALL') !== false) {
            array_shift($databases);
            foreach ($cats as $cat) {
                $dbcopy = preg_replace('ALL', $cat, $bf);
                array_push($databases, $dbcopy);
            }
        }
    }
    else {
        $databases = Corpus2DB($subtreebank, $treebank);
    }

    $sum = 0;

    for ($i = 0; $i < count($databases); $i++) {
        $database = $databases[$i];

        if ($treebank == 'sonar') {
            getMoreIncludes($database, $databases, $session);
        }

        if (!empty($database)) {
            $xquery = CreateXQueryCount($xpath, $database, $treebank);
            $query = $session->query($xquery);
            $count = $query->execute();

            $sum += $count;
        }
        $query->close();
    }

    return $sum;
}

function getMoreIncludes($database, &$databases, $session) {
    global $basexPathsSonar;

    $dbflag = false;
    foreach ($basexPathsSonar as $basex) {
      if (file_exists("$basex/$database")) {
        $dbflag = true;
        break;
      }
    }

    if ($dbflag) {
      $xq  = '/treebank/include';
      $xqinclude = 'db:open("' . $database . '")' . $xq;
      $query = $session->query($xqinclude);

      $basexinclude  = $query->execute();
      $basexincludes = explode("\n", $basexinclude);

      $query->close();

      foreach ($basexincludes as $include) {
  			$include = trim($include);
            if (!empty($include) && preg_match("/file=\"(.+)\"/", $include, $files)) {
                $file = $files[1];

                if (!includeAlreadyExists($file)) {
                    array_push($databases, $file);
                }
            }
        }
    }
    else {
        // warn("database does not exist");
    }
}

function includeAlreadyExists($include) {
    $ALREADY = $_SESSION['already'];
      if (isset($ALREADY{$include})) {return true;}
      else {
          $ALREADY{$include} = 1;
          $_SESSION['already'] = $ALREADY;
      }

      return false;
}
function CreateXQueryCount($xpath, $db, $treebank)
{
    $for = 'count(for $node in db:open("'.$db.'")/treebank';
    if ($treebank == 'sonar') $for .= '/tree';
    $return = ' return $node)';
    $xquery = $for.$xpath.$return;

    return $xquery;
}
function Corpus2DB($tblist, $treebank)
{
    // rename corpora to database names
    $databases = array();

    if ($treebank) {
        foreach ($tblist as $tb) {
            $treebank = strtoupper($treebank);
            $tb = strtoupper($tb);
            $tb = $treebank.'_ID_'.$tb;
            array_push($databases, "$tb");
        }

        return $databases;
    }

    return false;
}

function SetTotalSent($corpus)
{
    if ($corpus == 'lassy') {
        $TOTAL['LASSY_ID_DPC'] = '11716';
        $TOTAL['LASSY_ID_WIKI'] = '7341';
        $TOTAL['LASSY_ID_WRPE'] = '14420';
        $TOTAL['LASSY_ID_WRPP'] = '17691';
        $TOTAL['LASSY_ID_WSU'] = '14032';
        $TOTAL['TOTAL'] = '65200';
    } elseif ($corpus == 'cgn') {
        $TOTAL['CGN_ID_NA'] = '50239';
        $TOTAL['CGN_ID_NB'] = '2484';
        $TOTAL['CGN_ID_NC'] = '11649';
        $TOTAL['CGN_ID_NE'] = '3123';
        $TOTAL['CGN_ID_NF'] = '6290';
        $TOTAL['CGN_ID_NG'] = '1166';
        $TOTAL['CGN_ID_NH'] = '3064';
        $TOTAL['CGN_ID_NI'] = '2251';
        $TOTAL['CGN_ID_NJ'] = '2259';
        $TOTAL['CGN_ID_NK'] = '1923';
        $TOTAL['CGN_ID_NL'] = '1857';
        $TOTAL['CGN_ID_NM'] = '444';
        $TOTAL['CGN_ID_NN'] = '593';
        $TOTAL['CGN_ID_VA'] = '22881';
        $TOTAL['CGN_ID_VB'] = '4289';
        $TOTAL['CGN_ID_VC'] = '3142';
        $TOTAL['CGN_ID_VD'] = '929';
        $TOTAL['CGN_ID_VF'] = '2617';
        $TOTAL['CGN_ID_VG'] = '543';
        $TOTAL['CGN_ID_VH'] = '1395';
        $TOTAL['CGN_ID_VI'] = '1026';
        $TOTAL['CGN_ID_VJ'] = '536';
        $TOTAL['CGN_ID_VK'] = '558';
        $TOTAL['CGN_ID_VL'] = '601';
        $TOTAL['CGN_ID_VM'] = '107';
        $TOTAL['CGN_ID_VN'] = '701';
        $TOTAL['CGN_ID_VO'] = '3256';
        $TOTAL['TOTAL'] = '129923';
    } else {
        return 'ERROR!';
    }

    return $TOTAL;
}

function GetSentences($xpath, $treebank, $subtreebank, $context, $queryIteration, $session)
{
    global $flushLimit, $resultsLimit;
    $nrofmatches = 0;

    $dbIteration = $queryIteration[0];
    $endPosIteration = $queryIteration[1];

    if ($endPosIteration !== 'all') $leftOvers = $_SESSION['leftOvers'];

    if (isset($leftOvers) && !empty($leftOvers)) {
        foreach ($leftOvers as $key => $m) {
            ++$nrofmatches;

            $m = str_replace('<match>', '', $m);
            $m = trim($m);
            list($sentid, $sentence, $ids, $begins) = explode('||', $m);
            // Add unique identifier to avoid overlapping sentences w/ same ID
            $sentid .= '-dbIter='.$dbIteration.'+endPos='.$endPosIteration.'+leftover='.$nrofmatches;

            $sentid = trim($sentid);

            $sentences{$sentid} = $sentence;
            $idlist{$sentid} = $ids;
            $beginlist{$sentid} = $begins;

            unset($leftOvers[$key]);

            if ($endPosIteration !== 'all') {
                if ($nrofmatches >= $flushLimit) {
                    break;
                }
            }
        }
    }

    if ($nrofmatches < $flushLimit) {
      // rename corpora to database names
      $database = Corpus2DB($subtreebank, $treebank);

      $dbLength = count($database);

      for ($dbIteration; $dbIteration < $dbLength; ++$dbIteration) {
        $db = $database[$dbIteration];
        while (1) {
          if ($endPosIteration !== 'all') ++$endPosIteration;

          $input = CreateXQuery($xpath, $db, $treebank, $context, $endPosIteration);

          // create query instance
          $query = $session->query($input);

          // get results
          $match = $query->execute();
          $query->close();

          if (!$match) {
            if ($endPosIteration !== 'all') $endPosIteration = 0;
            break;
          }

          // put matches into array
          $matches = explode('</match>', $match);

          // remove empty elements from array
          $matches = array_filter($matches);

          // make a hash of all matching sentences, count hits per sentence and append matching IDs per sentence
          $matchLength = count($matches);
          for ($i = 0; $i < $matchLength; ++$i) {
            if ($endPosIteration === 'all') {
                if ($nrofmatches >= $resultsLimit) {
                    break 3;
                }
            }
            else {
                if ($nrofmatches >= $flushLimit) {
                    $overflow = array_slice($matches, $i);
                    $leftOvers = array_merge($leftOvers, $overflow);
                    break 3;
                }
            }
            $m = $matches[$i];
            $m = str_replace('<match>', '', $m);
            $m = trim($m);
            list($sentid, $sentence, $ids, $begins) = explode('||', $m);

            if (isset($sentid, $sentence, $ids, $begins)) {
              ++$nrofmatches;

              // Add unique identifier to avoid overlapping sentences w/ same ID
              $sentid .= '-dbIter='.$dbIteration.'+endPos='.$endPosIteration.'+match='.$nrofmatches;

              $sentid = trim($sentid);
              $sentences{$sentid} = $sentence;
              $idlist{$sentid} = $ids;
              $beginlist{$sentid} = $begins;
            }
          }
          if ($endPosIteration === 'all') break;
        }
      }
    }

    if (isset($sentences)) {
        if (isset($leftOvers) && !is_null($leftOvers)) {
            array_values(array_filter($leftOvers));
        } else {
            $leftOvers = array();
        }

        if ($endPosIteration !== 'all') {
          $_SESSION['leftOvers'] = $leftOvers;
          $_SESSION['queryIteration'] = array($dbIteration--, $endPosIteration++);
        }

        return array($sentences, $idlist, $beginlist);
    } else {
        // in case there are no results to be found
        return false;
    }
}

function GetSentencesSonar($xpath, $treebank, $component, $includes, $context, $queryIteration, $session) {
    global $flushLimit, $resultsLimit;
    $nrofmatches = 0;

    $dbIteration = $queryIteration[0];
    $endPosIteration = $queryIteration[1];

    if ($endPosIteration !== 'all') $leftOvers = $_SESSION['leftOvers'];

    if (isset($leftOvers) && !empty($leftOvers)) {
        foreach ($leftOvers as $key => $m) {
            ++$nrofmatches;

            $m = str_replace('<match>', '', $m);
            $m = trim($m);
            list($sentid, $sentence, $ids, $begins) = explode('||', $m);
            // Add unique identifier to avoid overlapping sentences w/ same ID
            $sentid .= '-dbIter='.$dbIteration.'+endPos='.$endPosIteration.'+leftover='.$nrofmatches;

            $sentid = trim($sentid);

            $sentences{$sentid} = $sentence;
            $idlist{$sentid} = $ids;
            $beginlist{$sentid} = $begins;

            unset($leftOvers[$key]);

            if ($endPosIteration !== 'all') {
                if ($nrofmatches >= $flushLimit) {
                    break;
                }
            }
        }
    }

    if ($nrofmatches < $flushLimit) {
      for ($dbIteration; $dbIteration < count($includes); ++$dbIteration) {
        $db = $includes[$dbIteration];
        getMoreIncludes($db, $includes, $session);
        while (1) {
          if ($endPosIteration !== 'all') ++$endPosIteration;

          $input = CreateXQuery($xpath, $db, $treebank, $context, $endPosIteration);

          // create query instance
          $query = $session->query($input);

          // get results
          $match = $query->execute();
          $query->close();

          if (!$match) {
            if ($endPosIteration !== 'all') $endPosIteration = 0;
            break;
          }

          // put matches into array
          $matches = explode('</match>', $match);

          // remove empty elements from array
          $matches = array_filter($matches);

          // make a hash of all matching sentences, count hits per sentence and append matching IDs per sentence
          $matchLength = count($matches);
          for ($i = 0; $i < $matchLength; ++$i) {
            if ($endPosIteration === 'all') {
                if ($nrofmatches >= $resultsLimit) {
                    break 3;
                }
            }
            else {
                if ($nrofmatches >= $flushLimit) {
                    $overflow = array_slice($matches, $i);
                    $leftOvers = array_merge($leftOvers, $overflow);
                    break 3;
                }
            }
            $m = $matches[$i];
            $m = str_replace('<match>', '', $m);
            $m = trim($m);
            list($sentid, $sentence, $ids, $begins) = explode('||', $m);

            if (isset($sentid, $sentence, $ids, $begins)) {
              ++$nrofmatches;

              // Add unique identifier to avoid overlapping sentences w/ same ID
              $sentid .= '-dbIter='.$dbIteration.'+endPos='.$endPosIteration.'+match='.$nrofmatches;

              $sentid = trim($sentid);
              $sentences{$sentid} = $sentence;
              $idlist{$sentid} = $ids;
              $beginlist{$sentid} = $begins;
            }
          }
          if ($endPosIteration === 'all') break;
        }
      }
    }

    if (isset($sentences)) {
        if (isset($leftOvers) && !is_null($leftOvers)) {
            array_values(array_filter($leftOvers));
        } else {
            $leftOvers = array();
        }

        if ($endPosIteration !== 'all') {
          $_SESSION['leftOvers'] = $leftOvers;
          $_SESSION['queryIteration'] = array($dbIteration--, $endPosIteration++);
          $_SESSION['includes'] = $includes;
        }

        return array($sentences, $idlist, $beginlist);
    } else {
        // in case there are no results to be found
        return false;
    }
}

function CreateXQuery($xpath, $db, $treebank, $context, $endPosIteration)
{
    global $flushLimit, $resultsLimit;

    // create XQuery instance
    $for = 'for $node in db:open("'.$db.'")/treebank';
    if ($treebank == 'sonar') {
        $for .= "/tree";
        $sentid = 'let $sentid := ($node/ancestor::tree/@id)';
        $sentence = '
    return
    for $sentence in (db:open("sentence2treebank")/sentence2treebank/sentence[@nr=$sentid])
        let $tb := ($sentence/@part)';
    }
    else {
        $sentid = 'let $sentid := ($node/ancestor::alpino_ds/@id)';
        $sentence = 'let $sentence := ($node/ancestor::alpino_ds/sentence)';
    }

    $ids = 'let $ids := ($node//@id)';
    $begins = 'let $begins := ($node//@begin)';
    $beginlist = 'let $beginlist := (distinct-values($begins))';
    if ($context != 0) {
        $tb = strtoupper($tb);
        $dbs = $tb.'_ID_S';

        $text = 'let $text := fn:replace($sentid[1], \'(.+)(\d+)\', \'$1\')';
        $snr = 'let $snr := fn:replace($sentid[1], \'(.+)(\d+)\', \'$2\')';
        $prev = 'let $prev := (number($snr)-1)';
        $next = 'let $next := (number($snr)+1)';
        $previd = 'let $previd := concat($text, $prev)';
        $nextid = 'let $nextid := concat($text, $next)';

        $prevs = 'let $prevs := (db:open("'.$dbs.'")//s[id=$previd]/sentence)';
        $nexts = 'let $nexts := (db:open("'.$dbs.'")//s[id=$nextid]/sentence)';

        $return = ' return <match>{data($sentid)}||{data($prevs)}<i>{data($sentence)}</i>{data($nexts)}||{string-join($ids, \'-\')}||{string-join($beginlist, \'-\')}</match>';

        $xquery = $for.$xpath.$sentid.$sentence.$ids.$begins.$beginlist.$text.$snr.$prev.$next.$previd.$nextid.$prevs.$nexts.$return;
    } else {
        $return = ' return <match>{data($sentid)}||{data($sentence)}||{string-join($ids, \'-\')}||{string-join($beginlist, \'-\')}</match>';
        $xquery = $for.$xpath.$sentid.$sentence.$ids.$begins.$beginlist.$return;
    }

    // Adds positioning values:; limits possible output
    $openPosition = '(';
    // Never fetch more than the resultsLimit, not even with all
    if ($endPosIteration == 'all') {
        $closePosition = ')[position() = 1 to '.$resultsLimit.']';
    }
    // Only fetch the given flushLimit, and increment on each iteration
    else {
        $endPosition = $endPosIteration * $flushLimit;
        $startPosition = $endPosition - $flushLimit + 1;
        $closePosition = ')[position() = '.$startPosition.' to '.$endPosition.']';
    }

    $xquery = $openPosition.$xquery.$closePosition;

    return $xquery;
}

function SetDB2Corpus($corpus)
{
    if ($corpus == 'lassy') {
        $CORPUS['LASSY_ID_DPC'] = 'DPC';
        $CORPUS['LASSY_ID_WIKI'] = 'Wikipedia';
        $CORPUS['LASSY_ID_WRPE'] = 'WR-P-E';
        $CORPUS['LASSY_ID_WRPP'] = 'WR-P-P';
        $CORPUS['LASSY_ID_WSU'] = 'WS-U';
    } elseif ($corpus == 'cgn') {
        $CORPUS['CGN_ID_NA'] = 'NA';
        $CORPUS['CGN_ID_NB'] = 'NB';
        $CORPUS['CGN_ID_NC'] = 'NC';
        $CORPUS['CGN_ID_NE'] = 'NE';
        $CORPUS['CGN_ID_NF'] = 'NF';
        $CORPUS['CGN_ID_NG'] = 'NG';
        $CORPUS['CGN_ID_NH'] = 'NH';
        $CORPUS['CGN_ID_NI'] = 'NI';
        $CORPUS['CGN_ID_NJ'] = 'NJ';
        $CORPUS['CGN_ID_NK'] = 'NK';
        $CORPUS['CGN_ID_NL'] = 'NL';
        $CORPUS['CGN_ID_NM'] = 'NM';
        $CORPUS['CGN_ID_NN'] = 'NN';
        $CORPUS['CGN_ID_VA'] = 'VA';
        $CORPUS['CGN_ID_VB'] = 'VB';
        $CORPUS['CGN_ID_VC'] = 'VC';
        $CORPUS['CGN_ID_VD'] = 'VD';
        $CORPUS['CGN_ID_VF'] = 'VF';
        $CORPUS['CGN_ID_VG'] = 'VG';
        $CORPUS['CGN_ID_VH'] = 'VH';
        $CORPUS['CGN_ID_VI'] = 'VI';
        $CORPUS['CGN_ID_VJ'] = 'VJ';
        $CORPUS['CGN_ID_VK'] = 'VK';
        $CORPUS['CGN_ID_VL'] = 'VL';
        $CORPUS['CGN_ID_VM'] = 'VM';
        $CORPUS['CGN_ID_VN'] = 'VN';
        $CORPUS['CGN_ID_VO'] = 'VO';
    } elseif ($corpus == 'sonar') {
        $CORPUS['SONAR_ID_WRPEA_1'] = 'WRPEA_1';
        $CORPUS['SONAR_ID_WRPEA_2'] = 'WRPEA_2';
    } else {
        return 'ERROR!';
    }

    return $CORPUS;
}

function SetDB2CorpusDetailed($corpus)
{
    if ($corpus == 'lassy') {
        $CORPUS['LASSY_ID_DPC'] = 'DPC <span>(Dutch Parallel Corpus)</span>';
        $CORPUS['LASSY_ID_WIKI'] = 'Wikipedia <span>(Dutch Wikipedia pages)</span>';
        $CORPUS['LASSY_ID_WRPE'] = 'WR-P-E <span>(E-magazines, newsletters, teletext pages, web sites, Wikipedia)</span>';
        $CORPUS['LASSY_ID_WRPP'] = 'WR-P-P <span>(Books, brochures, guides and manuals, legal texts, newspapers, periodicals and magazines, policy documents, proceedings, reports, surveys)</span>';
        $CORPUS['LASSY_ID_WSU'] = 'WS-U <span>(Auto cues, news scripts, texts for the visually impaired)</span>';
    } elseif ($corpus == 'cgn') {
        $CORPUS['CGN_ID_NA'] = 'NA <span>(Spontaneous conversations (\'face-to-face\'))</span>';
        $CORPUS['CGN_ID_NB'] = 'NB <span>(Interviews with teachers of Dutch)</span>';
        $CORPUS['CGN_ID_NC'] = 'NC <span>(Telephone conversations (recorded via a switchboard))</span>';
        $CORPUS['CGN_ID_NE'] = 'NE <span>(Simulated business negotiations)</span>';
        $CORPUS['CGN_ID_NF'] = 'NF <span>(Interviews/discussions/debates (broadcast))</span>';
        $CORPUS['CGN_ID_NG'] = 'NG <span>((Political) discussions/debates/meetings (non-broadcast))</span>';
        $CORPUS['CGN_ID_NH'] = 'NH <span>(Lessons recorded in the classroom)</span>';
        $CORPUS['CGN_ID_NI'] = 'NI <span>(Live (sports) commentaries (broadcast))</span>';
        $CORPUS['CGN_ID_NJ'] = 'NJ <span>(Newsreports (broadcast))</span>';
        $CORPUS['CGN_ID_NK'] = 'NK <span>(News (broadcast))</span>';
        $CORPUS['CGN_ID_NL'] = 'NL <span>(Commentaries/columns/reviews (broadcast))</span>';
        $CORPUS['CGN_ID_NM'] = 'NM <span>(Ceremonious speeches/sermons)</span>';
        $CORPUS['CGN_ID_NN'] = 'NN <span>(Lectures/seminars)</span>';
        $CORPUS['CGN_ID_VA'] = 'VA <span>(Spontaneous conversations (\'face-to-face\'))</span>';
        $CORPUS['CGN_ID_VB'] = 'VB <span>(Interviews with teachers of Dutch)</span>';
        $CORPUS['CGN_ID_VC'] = 'VC <span>(Telephone conversations (recorded via a switchboard))</span>';
        $CORPUS['CGN_ID_VD'] = 'VD <span>(Telephone conversations (recorded on MD))</span>';
        $CORPUS['CGN_ID_VF'] = 'VF <span>(Interviews/discussions/debates (broadcast))</span>';
        $CORPUS['CGN_ID_VG'] = 'VG <span>((Political) discussions/debates/meetings (non-broadcast))</span>';
        $CORPUS['CGN_ID_VH'] = 'VH <span>(Lessons recorded in the classroom)</span>';
        $CORPUS['CGN_ID_VI'] = 'VI <span>(Live (sports) commentaries (broadcast))</span>';
        $CORPUS['CGN_ID_VJ'] = 'VJ <span>(Newsreports (broadcast))</span>';
        $CORPUS['CGN_ID_VK'] = 'VK <span>(News (broadcast))</span>';
        $CORPUS['CGN_ID_VL'] = 'VL <span>(Commentaries/columns/reviews (broadcast))</span>';
        $CORPUS['CGN_ID_VM'] = 'VM <span>(Ceremonious speeches/sermons)</span>';
        $CORPUS['CGN_ID_VN'] = 'VN <span>(Lectures/seminars)</span>';
        $CORPUS['CGN_ID_VO'] = 'VO <span>(Read speech)</span>';
    } elseif ($corpus == 'sonar') {
        $CORPUS['SONAR_ID_WRPEA_1'] = 'WRPEA_1';
        $CORPUS['SONAR_ID_WRPEA_2'] = 'WRPEA_2';
    } else {
        return 'ERROR!';
    }

    return $CORPUS;
}
