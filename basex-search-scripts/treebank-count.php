<?php
/**
 * $databases is actually a copy of the first breadth-first pattern. One would
 * argue that includes was a better name. However, to keep some cohesion between
 * SONAR on the one hand and CGN and Lassy on the other, we call both the includes
 * as well as the result of corpusToDatabase "databases"
 *
 */
function getCounts($xpath, $treebank, $subtreebank, $databases, $session)
{
    global $cats;
    if ($treebank == 'sonar') {
        $bf = $databases[0];
        if (strpos($bf, 'ALL') !== false) {
            array_shift($databases);
            foreach ($cats as $cat) {
                $dbcopy = str_replace('ALL', $cat, $bf);
                array_push($databases, $dbcopy);
            }
        }
    }
    else {
        $databases = corpusToDatabase($subtreebank, $treebank);
    }
    $sum = 0;
    $counts = array();
    for ($i = 0; $i < count($databases); $i++) {
        $database = $databases[$i];

        if ($treebank == 'sonar') {
            getMoreIncludes($database, $databases, $session);
        }

        if (!empty($database)) {
            $xquery = createXqueryCount($xpath, $database, $treebank);
            $query = $session->query($xquery);

            if ($treebank != 'sonar') {
              $counts{$database} = $query->execute();
            }
            else {
              $sum += $query->execute();
            }

        }
        $query->close();
    }

    if ($treebank != 'sonar') {
      $sum = array_sum($counts);
    }

    return array($sum, $counts);
}

function createCsvCounts($sum, $counts) {
  if (isset($counts) && count($counts) > 0 && $sum > 0) {
    global $tmp, $id;
    // Save distribution to file
    // Write results to file so that they can be downloaded later on
    // If the file already exists, remove it and re-create it (just to be sure)
    $fileName = "$tmp/$id-gretel-distribution.csv";
    if (file_exists($fileName)) {
        unlink($fileName);
    }

    $fh = fopen($fileName, 'w');
    fputcsv($fh, array('Treebank', 'Hits', '# sentences in treebank'));

    foreach ($counts as $database => $countsArray) {
      $dbStringArray = explode('_', $database);
      $dbString = $dbStringArray[2];
      fputcsv($fh, array($dbString, $countsArray[0], $countsArray[1]));
    }
    fclose($fh);
  }
}

function createXqueryCount($xpath, $db, $treebank)
{
    $for = 'count(for $node in db:open("'.$db.'")/treebank';
    if ($treebank == 'sonar') $for .= '/tree';
    $return = ' return $node)';
    $xquery = $for.$xpath.$return;

    return $xquery;
}

function getTotalSentences($corpus)
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
        return false;
    }

    return $TOTAL;
}
