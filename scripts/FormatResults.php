<?php

function NumFormatHash($hash)
{
    foreach ($hash as $key => $value) {
        $NUMFOR{$key} = number_format($value);
    }

    return array($NUMFOR);
}

function printCounts($treebank, $HITS, $MS, $TOTALS, $TOTALCOUNTS)
{
    // print table with results
    $CORPUS = SetDB2CorpusDetailed($treebank);
    echo '<table id="results"><thead><tr>'.
        '<th>Treebank</th><th>Hits</th><th>Matching sentence</th><th>Sentences in treebank</th>' .
        '</tr></thead>';
    foreach ($HITS as $dbname => $h) {
        echo "<tr><td>$CORPUS[$dbname]</td><td>$h<td>$MS[$dbname]</td><td>$TOTALS[$dbname]</td></tr>";
    }
    echo "<tr><td>Total</td><td>$TOTALCOUNTS[hits]<td>$TOTALCOUNTS[ms]</td><td>$TOTALCOUNTS[totals]</td></tr>";
    echo "</table>";
}

function printCountsCsv($treebank, $HITS, $MS, $TOTALS, $TOTALCOUNTS)
{
    // print table with results
    // $CORPUS = SetDB2Corpus($treebank);

    echo "treebank,hits,matching-sentences,sentences-in-treebank\n";

    foreach ($HITS as $dbname => $h) {
        echo "$CORPUS[$dbname],$h,$MS[$dbname],$TOTALS[$dbname]\n";
    }
    echo "Total,$TOTALCOUNTS[hits],$TOTALCOUNTS[ms],$TOTALCOUNTS[totals]\n";
}

function printCountsPF($treebank, $HITS, $MS, $TOTALS, $TOTALCOUNTS)
{
    // print table with results
    $CORPUS = SetDB2Corpus($treebank);
    echo '<table id="results"><thead><tr>'.
        '<th>Treebank</th><th>Hits</th><th>Matching sentence</th><th>Sentences in treebank</th>'.
        '</tr></thead>';

    foreach ($HITS as $dbname => $h) {
        echo "<tr><td>$CORPUS[$dbname]</td><td>$h<td>$MS[$dbname]</td><td>$TOTALS[$dbname]</td></tr>\n";
    }
    echo "<tr><td>Total</td><td>$TOTALCOUNTS[hits]<td>$TOTALCOUNTS[ms]</td><td>$TOTALCOUNTS[totals]</td></tr>";
    echo "</table>";
}

function printMatchesTxt($sentences)
{
    // NOTE: sentence IDs are the keys of all hashes
    foreach ($sentences as $id => $sentence) {
        echo "$id\t$sentence\n";
    }
}

function printMatchesPF($sentences, $counthits, $idlist, $beginlist)
{
    // NOTE: sentence IDs are the keys of all hashes
    echo '<table id="matches"><thead>'.
        '<tr><th>Sentence ID</th><th>Matching sentence</th><th>Hits</th></tr>'.
        '</thead><tbody>';

    foreach ($sentences as $id => $sentence) { // print matching sentence and hits per sentence
        // highlight sentence
        $hlsentence = HighlightSentence($sentence, $beginlist[$id]);
        // deal with quotes/apos
        $trans = array('"' => '&quot;', "'" => "&apos;");
        $hlsentence = strtr($hlsentence, $trans);

        echo '<tr><td>'.$id.'</td><td>'.$hlsentence.'</td><td>'.$counthits[$id].'</td></tr>';
    }
    echo "</tbody></table>";
}

function HighlightSentence($sentence, $beginlist)
{

    if (preg_match('/<i>/', $sentence)) {
        $s = preg_replace("/(.*<i>)(.*?)(<\/i>.*)/", '$2', $sentence);
        $prev = preg_replace("/(.*<i>)(.*?)(<\/i>.*)/", '$1', $sentence);
        $next = preg_replace("/(.*<i>)(.*?)(<\/i>.*)/", '$3', $sentence);
    } else {
        $s = $sentence;
    }
    $words=explode(' ', $s);
    $begins=explode('-',$beginlist);

    $i = 0;
    foreach ($words as $word) {
        if (in_array($i, $begins)) {
            $val = '';
            if (!in_array($i-1, $begins)) {
                $val .= "<strong>";
            }
            $val .= $words[$i];
            if (!in_array($i+1, $begins)) {
                $val .= "</strong>";
            }
            $words[$i]= $val;
        }
        $i++;
    }
    $hlsentence= implode(' ', $words);
    if (isset($prev)||isset($next)) {
      $hlsentence=$prev.' '.$hlsentence.' '.$next;
    }
    return $hlsentence;
}
