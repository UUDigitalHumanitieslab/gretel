<?php

function getMoreIncludes($database, &$databases, $session) {
    $xq = '/treebank/include';
    $xqinclude = 'db:open("' . $database . '")' . $xq;
    $query = $session->query($xqinclude);

    $basexinclude  = $query->execute();
    $basexincludes = explode("\n", $basexinclude);

    $query->close();

    $pattern = '/file=\"(.+)\"/';
    foreach ($basexincludes as $include) {
			$include = trim($include);
      if (!empty($include) && preg_match($pattern, $include, $files)) {
        $file = $files[1];

        if (!includeAlreadyExists($file)) {
          array_push($databases, $file);
        }
      }
    }
}

function includeAlreadyExists($include) {
  session_start();
  $ALREADY = $_SESSION['already'];
  if (isset($ALREADY{$include})) {
    session_write_close();
    return true;
  } else {
    $ALREADY{$include} = 1;
    $_SESSION['already'] = $ALREADY;
    session_write_close();
    return false;
  }
}

function corpusToDatabase($tblist, $treebank)
{
    // rename corpora to database names
    $databases = array();

      foreach ($tblist as $tb) {
          $treebank = strtoupper($treebank);
          $tb = strtoupper($tb);
          $tb = $treebank.'_ID_'.$tb;
          array_push($databases, $tb);
      }

      return $databases;
}

function getSentences($xpath, $treebank, $subtreebank, $context, $queryIteration, $session)
{
    global $flushLimit, $resultsLimit;
    $nrofmatches = 0;

    $dbIteration = $queryIteration[0];
    $endPosIteration = $queryIteration[1];

    if ($endPosIteration !== 'all') {
        session_start();
        $leftOvers = $_SESSION['leftOvers'];
        session_write_close();
    }

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
      $database = corpusToDatabase($subtreebank, $treebank);

      $dbLength = count($database);

      for ($dbIteration; $dbIteration < $dbLength; ++$dbIteration) {
        $db = $database[$dbIteration];
        while (1) {
          if ($endPosIteration !== 'all') ++$endPosIteration;

          $input = createXquery($xpath, $db, $treebank, false, $context, $endPosIteration);

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
          session_start();
          $_SESSION['leftOvers'] = $leftOvers;
          $_SESSION['queryIteration'] = array($dbIteration--, $endPosIteration++);
          session_write_close();
        }

        return array($sentences, $idlist, $beginlist);
    } else {
        // in case there are no results to be found
        return false;
    }
}

function getSentencesSonar($xpath, $treebank, $component, $includes, $context, $queryIteration, $session) {
    global $flushLimit, $resultsLimit;
    $nrofmatches = 0;

    $dbIteration = $queryIteration[0];
    $endPosIteration = $queryIteration[1];

    if ($endPosIteration !== 'all') {
      session_start();
      $leftOvers = $_SESSION['leftOvers'];
      session_write_close();
    }

    if (isset($leftOvers) && !empty($leftOvers)) {
        foreach ($leftOvers as $key => $m) {
            ++$nrofmatches;

            $m = str_replace('<match>', '', $m);
            $m = trim($m);

            list($sentid, $sentence, $tb, $ids, $begins) = explode('||', $m);

            // Add unique identifier to avoid overlapping sentences w/ same ID
            $sentid .= '-dbIter='.$dbIteration.'+endPos='.$endPosIteration.'+leftover='.$nrofmatches;

            $sentid = trim($sentid);

            $sentences{$sentid} = $sentence;
            $tblist{$sentid} = $tb;
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

          $input = createXquery($xpath, $db, $treebank, $component, $context, $endPosIteration);

          // create query instance
          $query = $session->query($input);

          // get results
          $match = $query->execute();
          $query->close();

          if (!isset($match)) {
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

            // TO DO; if content is ON

            list($sentid, $sentence, $tb, $ids, $begins) = explode('||', $m);

            if (isset($sentid, $sentence, $tb, $ids, $begins)) {
              ++$nrofmatches;

              // Add unique identifier to avoid overlapping sentences w/ same ID
              $sentid .= '-dbIter='.$dbIteration.'+endPos='.$endPosIteration.'+match='.$nrofmatches;

              $sentid = trim($sentid);
              $sentences{$sentid} = $sentence;
              $tblist{$sentid} = $tb;
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
          session_start();
          $_SESSION['leftOvers'] = $leftOvers;
          $_SESSION['queryIteration'] = array($dbIteration--, $endPosIteration++);
          $_SESSION['includes'] = $includes;
          session_write_close();
        }

        return array($sentences, $tblist, $idlist, $beginlist);
    }
}

function createXquery($xpath, $db, $treebank, $component, $context, $endPosIteration)
{
    global $flushLimit, $resultsLimit;

    $for = 'for $node in db:open("'.$db.'")/treebank';
    if ($treebank == 'sonar') {
        $for .= "/tree";
        $sentid = 'let $sentid := ($node/ancestor::tree/@id)';
        $sentence = '
    return
    for $sentence in (db:open("'.$component[0].'sentence2treebank")/sentence2treebank/sentence[@nr=$sentid])
        let $tb := ($sentence/@part)';
    }
    else {
        $sentid = 'let $sentid := ($node/ancestor::alpino_ds/@id)';
        $sentence = 'let $sentence := ($node/ancestor::alpino_ds/sentence)';
    }


    $returnTb = ($treebank == 'sonar') ? '||{data($tb)}' : '';

    $ids = 'let $ids := ($node//@id)';
    $begins = 'let $begins := ($node//@begin)';
    $beginlist = 'let $beginlist := (distinct-values($begins))';
    if ($context) {
      if ($treebank != 'sonar') {
        $dbs = strtoupper($treebank).'_ID_S';
      } else {
        $dbs = $component[0].'sentence2treebank';
      }

        $text = 'let $text := fn:replace($sentid[1], \'(.+?)(\d+)$\', \'$1\')';
        $snr = 'let $snr := fn:replace($sentid[1], \'(.+?)(\d+)$\', \'$2\')';
        $prev = 'let $prev := (number($snr)-1)';
        $next = 'let $next := (number($snr)+1)';
        $previd = 'let $previd := concat($text, $prev)';
        $nextid = 'let $nextid := concat($text, $next)';

        $prevs = 'let $prevs := (db:open("'.$dbs.'")';
        $nexts = 'let $nexts := (db:open("'.$dbs.'")';

        if ($treebank != 'sonar') {
          $prevs .= '//s[id=$previd]/sentence)';
          $nexts .= '//s[id=$nextid]/sentence)';
        } else {
          $prevs .= '/sentence2treebank/sentence[@nr=$previd])';
          $nexts .= '/sentence2treebank/sentence[@nr=$nextid])';
        }

        $return = ' return <match>{data($sentid)}||{data($prevs)} <em>{data($sentence)}</em> {data($nexts)}'
            . $returnTb . '||{string-join($ids, \'-\')}||{string-join($beginlist, \'-\')}</match>';

        $xquery = $for.$xpath.$sentid.$sentence.$ids.$begins.$beginlist.$text.$snr.$prev.$next.$previd.$nextid.$prevs.$nexts.$return;
    } else {
        $return = ' return <match>{data($sentid)}||{data($sentence)}' . $returnTb
            . '||{string-join($ids, \'-\')}||{string-join($beginlist, \'-\')}</match>';
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

function highlightSentence($sentence, $beginlist, $tag)
{
    if (strpos($sentence, '<em>') !== false) {
      preg_match("/(.*<em>)(.*?)(<\/em>.*)/", $sentence, $groups);
        $s = $groups[2];
        $prev = $groups[1];
        $next = $groups[3];
    } else {
        $s = $sentence;
    }
    $words = explode(' ', $s);
    $begins = explode('-',$beginlist);

    $i = 0;
    // Instead of wrapping each individual word in a tag, merge sequences
    // of words in one <tag>...</tag>
    foreach ($words as $word) {
        if (in_array($i, $begins)) {
            $val = '';
            if (!in_array($i-1, $begins)) {
                $val .= "<$tag>";
            }
            $val .= $words[$i];
            if (!in_array($i+1, $begins)) {
                $val .= "</$tag>";
            }
            $words[$i]= $val;
        }
        $i++;
    }
    $hlsentence = implode(' ', $words);
    if (isset($prev) || isset($next)) {
      $hlsentence = $prev.' '.$hlsentence.' '.$next;
    }
    return $hlsentence;
}
