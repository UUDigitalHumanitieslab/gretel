<?php

function getCounts($databases, $already, $session, $xpath, $corpus)
{
    global $needRegularGrinded;

    $sum = 0;
    $counts = array();

    while ($database = array_pop($databases)) {
        if (isGrinded($corpus) && !$needRegularGrinded) {
            getMoreIncludes($database, $databases, $already, $session);
        }
        $xquery = createXqueryCount($database, $xpath, $corpus);
        $query = $session->query($xquery);

        if (isGrinded($corpus)) {
            $sum += $query->execute();
        } else {
            $counts[$database] = $query->execute();
        }

        $query->close();
    }

    if (!isGrinded($corpus)) {
        $sum = array_sum($counts);
    }

    return array($sum, $counts);
}

function createXqueryCount($database, $xpath, $corpus)
{
    global $needRegularGrinded;
    $for = 'count(for $node in db:open("'.$database.'")/treebank';
    if (isGrinded($corpus) && !$needRegularGrinded) {
        $for .= '/tree';
    }
    $return = ' return $node)';
    $xquery = $for.$xpath.$return;

    return $xquery;
}
