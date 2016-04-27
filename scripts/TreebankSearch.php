<?php

function GetCounts($xpath, $treebank, $subtreebank)
{
    global $dbhost, $dbport, $dbuser, $dbpwd;
    $databases = Corpus2DB($subtreebank, $treebank);
    $sum = 0;
    // create session
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
    foreach ($databases as $database) {
        $xquery = CreateXQueryCount($xpath, $database);
        $query = $session->query($xquery);
        $count = $query->execute();

        $sum += $count;

        $query->close();
    }
    $session->close();
    return $sum;
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

function CreateXQueryCount($xpath, $db) {
        $for = 'count(for $node in db:open("'.$db.'")/treebank';
        $return = 'return $node)';
        $xquery = $for.$xpath.$return;

        return $xquery;
}

function GetSentences($xpath, $treebank, $subtreebank, $context, $queryIteration)
{
    global $resultlimit, $dbhost, $dbport, $dbuser, $dbpwd;
    // create session
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
    // rename corpora to database names
    $database = Corpus2DB($subtreebank, $treebank);

    $nrofmatches = 0;
    foreach ($database as $db) {
        // create XQuery
        $input = CreateXQuery($xpath, $db, $treebank, $context, $queryIteration);
        // create query instance
        $query = $session->query($input);

        // get results
        $match = $query->execute();
        $query->close();

        if (!$match) continue;

        // put matches into array
        $matches = explode('</match>', $match);
        
        // remove empty elements from array
        $matches = array_filter($matches);

        // make a hash of all matching sentences, count hits per sentence and append matching IDs per sentence
        foreach ($matches as $m) {
            if ($queryIteration != "all") {
                if ($nrofmatches >= $resultlimit) {
                    break 2;
                }
            }
            $m = str_replace('<match>', '', $m);
            trim($m);
            list($sentid, $sentence, $ids, $begins) = explode('||', $m);

            $sentences{$sentid} = $sentence;
            $idlist{$sentid} = $ids;
            $beginlist{$sentid} = $begins;

            $nrofmatches++;
        }
    }

    $session->close();

    // Make sure that the IDs returned is a list of unique values. Remove duplicates
    if (isset($sentences)) {
        $uniquebeginlist = array();
        foreach ($beginlist as $sentid => $begins) {
            $begins = explode('-', $begins);
            $begins = array_unique($begins, SORT_NUMERIC);
            $begins = implode('-', $begins);

            $uniquebeginlist{$sentid} = $begins;
        }
        return array($sentences, $idlist, $uniquebeginlist);
    } else {
        // in case there are no results found
        return false;
    }
}

function CreateXQuery($xpath, $db, $tb, $context, $queryIteration)
{
    global $resultlimit;

    if ($queryIteration != "all") {
        $endPosition = 1 + ($queryIteration * $resultlimit);
        $startPosition = $endPosition - $resultlimit;

        $openPosition = '(';
        $closePosition = ')[position() = '.$startPosition.' to '.$endPosition.']';
    }
  // create XQuery instance
    $for = 'for $node in db:open("'.$db.'")/treebank';
    $sentid = 'let $sentid := ($node/ancestor::alpino_ds/@id)';
    $sentence = 'let $sentence := ($node/ancestor::alpino_ds/sentence)';
    $ids = 'let $ids := ($node//@id)';
    $begins = 'let $begins := ($node//@begin)';
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

        $return = 'return <match>{data($sentid)}||{data($prevs)}<i>{data($sentence)}</i>{data($nexts)}||{string-join($ids, \'-\')}||{string-join($begins, \'-\')}</match>';

        $xquery = $for.$xpath.$sentid.$sentence.$ids.$begins.$text.$snr.$prev.$next.$previd.$nextid.$prevs.$nexts.$return;
    } else {
        $return = 'return <match>{data($sentid)}||{data($sentence)}||{string-join($ids, \'-\')}||{string-join($begins, \'-\')}</match>';
        $xquery = $for.$xpath.$sentid.$sentence.$ids.$begins.$return;
    }

    if ($queryIteration != "all") {
        $xquery = $openPosition.$xquery.$closePosition;
    }

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
