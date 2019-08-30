<?php

/**
 * Databases containing grinded data ofter refer each other.
 * Retrieve the recursive includes for this database (result does not include this db itself).
 *
 * @param string  $database
 * @param Session $session
 *
 * @return string[]
 */
function getMoreIncludes($database, $session)
{
    $xquery = 'db:open("'.$database.'")/treebank/include';
    $query = $session->query($xquery);
    $result = $query->execute();
    $query->close();

    $newIncludes = explode("\n", $result);
    $newIncludes = array_cleaner($newIncludes);

    $pattern = '/file=\"(.+)\"/';

    $databases = array();
    foreach ($newIncludes as $newInclude) {
        if (preg_match($pattern, $newInclude, $files)) {
            $file = $files[1];
            $databases[] = $file;
        }
    }

    return $databases;
}

/**
 * Sometimes a component is split up into multiple databases (sometimes hundreds!)
 * These should be stored in a file containing the database names, one per line.
 * If the file is missing, the original component is assumed to share its name with its database.
 *
 * @param string $corpus
 * @param string $component
 *
 * @return string[]
 */
function getUngrindedDatabases($corpus, $component)
{
    $path = ROOT_PATH."/treebank-parts/$corpus/$component.lst";
    if (file_exists($path)) {
        $databasesForComponent = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    } else {
        $databasesForComponent = false;
    }

    return $databasesForComponent ?: array($component);
}

/**
 * Databases containing grinded data ofter refer each other.
 * Retrieve the recursive includes for this database (result does not include this db itself).
 * For some xpaths this does not apply, because the search runs faster in the normal databases.
 * This function resolves the databases to use and sets the global $needRegularGrinded depending
 * on whether to use dbs containing the normal (true) or grinded data (false).
 *
 * @param string       $corpus
 * @param string       $component
 * @param string|false $bf
 *
 * @return string[]
 */
function getGrindedDatabases($corpus, $component, $bf)
{
    // TODO factor out $needRegularGrinded.
    global $cats, $needRegularGrinded;

    // Depending on the xpath sometimes searching the normal data is still faster.
    if (!$bf || $bf === 'ALL') {
        $needRegularGrinded = true;

        return getUngrindedDatabases($corpus, $component);
    }

    $needRegularGrinded = false;
    $databases = array();

    // If is substring (eg. ALLnp%det)
    if (strpos($bf, 'ALL') !== false) {
        foreach ($cats as $cat) {
            $bfcopy = $component.str_replace('ALL', $cat, $bf);
            $databases[] = $bfcopy;
        }
    } else {
        $databases[] = $component.$bf;
    }

    $serverInfo = getServerInfo($corpus, $component);
    $session = new Session($serverInfo['machine'], $serverInfo['port'], $serverInfo['username'], $serverInfo['password']);

    // recursively expand the databases and verify they exist.
    $seenDatabases = array();
    while (!empty($databases)) {
        $database = array_pop($databases);
        if (array_key_exists($database, $seenDatabases)) {
            continue;
        }
        if ($session->query("db:exists('$database')")->execute() == 'false') {
            continue;
        }

        $seenDatabases[$database] = true;

        foreach (getMoreIncludes($database, $session) as $newdb) {
            $databases[] = $newdb;
        }
    }
    $session->close();

    return array_keys($seenDatabases);
}

/**
 * Get the databases to query for this component.
 * The xpath is required because it controls the databases to use when the corpus is grinded.
 * Might return the original database anyway if the xpath would run faster on that one
 * (and the component is not otherwise split up into multiple dbs).
 *
 * @param string $corpus
 * @param string $component
 * @param string $xpath
 *
 * @return string[]
 */
function getDatabases($corpus, $component, $xpath)
{
    if (!isGrinded($corpus)) {
        return getUngrindedDatabases($corpus, $component);
    }

    // Now for the grinded case:
    $bf = xpathToBreadthFirst($xpath);

    return getGrindedDatabases($corpus, $component, $bf);
}

/**
 * @param string   $corpus          the corpus we're searching
 * @param string   $component       the component we're searching
 * @param string[] $databases       the databases that remain to be searched in this component
 * @param int      $endPosIteration page number to return
 * @param Session  $session         the basex session
 * @param int      $searchlimit
 * @param array    $variables       An array with variables to return. Each element should contain name and path.
 */
function getSentences($corpus, $component, $databases, $endPosIteration, $session, $searchLimit, $xpath, $context, $variables = null)
{
    global $flushLimit, $needRegularGrinded;

    $xquery = 'N/A';
    try {
        $matchesAmount = 0;

        while ($database = array_pop($databases)) {
            while (1) {
                if ($endPosIteration !== 'all') {
                    ++$endPosIteration;
                }

                $xquery = createXquery($corpus, $component, $database, $endPosIteration, $searchLimit, $flushLimit, $needRegularGrinded, $context, $xpath, $variables);
                $query = $session->query($xquery);
                $result = $query->execute();
                $query->close();

                if (!$result || $result == 'false') {
                    if ($endPosIteration !== 'all') {
                        // go to the next database and start at the first position of that
                        $endPosIteration = 0;
                    }

                    break;
                }

                $matches = explode('</match>', $result);
                $matches = array_cleaner($matches);

                while ($match = array_shift($matches)) {
                    if ($endPosIteration === 'all' && $matchesAmount >= $searchLimit) {
                        break 3;
                    }
                    $match = str_replace('<match>', '', $match);

                    if (isGrinded($corpus)) {
                        list($sentid, $sentence, $tb, $ids, $begins) = explode('||', $match);
                    } else {
                        list($sentid, $sentence, $ids, $begins, $xml_sentences, $meta) = explode('||', $match);
                    }

                    if (isset($sentid, $sentence, $ids, $begins)) {
                        ++$matchesAmount;

                        $sentid = trim($sentid);

                        // Add unique identifier to avoid overlapping sentences w/ same ID
                        $sentid .= '-endPos='.$endPosIteration.'+match='.$matchesAmount;

                        $sentences[$sentid] = $sentence;
                        $idlist[$sentid] = $ids;
                        $beginlist[$sentid] = $begins;
                        $xmllist[$sentid] = $xml_sentences;
                        $metalist[$sentid] = $meta;
                        preg_match('/<vars>.*<\/vars>/s', $match, $varMatches);
                        $varList[$sentid] = count($varMatches) == 0 ? '' : $varMatches[0];
                        if (isGrinded($corpus)) {
                            $tblist[$sentid] = $tb;
                        }
                        $sentenceDatabases[$sentid] = $component;
                    }
                }
                if ($endPosIteration === 'all') {
                    break;
                } elseif ($matchesAmount >= $flushLimit) {
                    // Re-add pop'd database because it is very likely we aren't finished with it
                    // More results are still in that database but because of the flushlimit we
                    // have to bail out
                    // NOTE: add to start or next run will apply pagination parameter to the wrong database
                    array_unshift($databases, $database);

                    break 2;
                }
            }
        }

        if (isset($sentences)) {
            if (!isGrinded($corpus)) {
                $tblist = false;
            }

            return array(
                'success' => true,
                'sentences' => $sentences,
                'tblist' => $tblist,
                'idlist' => $idlist,
                'beginlist' => $beginlist,
                'xmllist' => $xmllist,
                'metalist' => $metalist,
                'varlist' => $varList,
                'endPosIteration' => $endPosIteration,
                'remainingDatabases' => $databases,
                'sentenceDatabases' => $sentenceDatabases,
                'xquery' => $xquery,
            );
        } else {
            // in case there are no results to be found
            return array('success' => false, 'xquery' => $xquery);
        }
    } catch (Exception $e) {
        // allow a developer to directly debug this query (log is truncated)
        echo $xquery;
        http_response_code(500);
        die;
    }
}

function createXquery($corpus, $component, $database, $endPosIteration, $searchLimit, $flushLimit, $needRegularGrinded, $context, $xpath, $variables)
{
    $variable_declarations = '';
    $variable_results = '';

    if (isset($variables) && $variables != null) {
        foreach ($variables as $index => $value) {
            $name = $value['name'];
            if ($name != '$node') {
                // the root node is already declared in the query itself, do not declare it again
                $variable_declarations .= 'let '.$name.' := ('.$value['path'].')[1]';
            }
            $variable_results .= '<var name="'.$name.'">{'.$name.'/@*}</var>';
        }
        $variable_results = '<vars>'.$variable_results.'</vars>';
    }

    $for = 'for $node in db:open("'.$database.'")/treebank';
    if (isGrinded($corpus) && !$needRegularGrinded) {
        $for .= '/tree';
        $tree = 'let $tree := ($node/ancestor::tree)';
        $sentence = '
    return
    for $sentence in (db:open("'.$component.'sentence2treebank")/sentence2treebank/sentence[@nr=$sentid])
        let $tb := ($sentence/@part)';
    } else {
        $tree = 'let $tree := ($node/ancestor::alpino_ds)';
        $sentence = 'let $sentence := ($tree/sentence)';
    }
    $sentid = 'let $sentid := ($tree/@id)';

    $regulartb = $needRegularGrinded ? "let \$tb := '$database'" : '';
    $returnTb = (isGrinded($corpus)) ? '||{data($tb)}' : '';

    $meta = 'let $meta := ($tree/metadata/meta)';

    $ids = 'let $ids := ($node//@id)';
    $begins = 'let $indexs := (distinct-values($node//@index))
    let $indexed := ($tree//node[@index=$indexs])
    let $begins := (($node | $indexed)//@begin)';
    $beginlist = 'let $beginlist := (distinct-values($begins))';
    if (isGrinded($corpus) && !$needRegularGrinded) {
        // should have only one slash when grinding
        $xpath = '/'.preg_replace('/^\/+/', '', $xpath);
    }
    if ($context && !$needRegularGrinded) {
        if (isGrinded($corpus)) {
            $text = 'let $text := fn:replace($sentid[1], \'(.+?)(\d+)$\', \'$1\')';
            $snr = 'let $snr := fn:replace($sentid[1], \'(.+?)(\d+)$\', \'$2\')';
            $prev = 'let $prev := (number($snr)-1)';
            $next = 'let $next := (number($snr)+1)';
            $previd = 'let $previd := concat($text, $prev)';
            $nextid = 'let $nextid := concat($text, $next)';

            $prevs = 'let $prevs := root($sentence)/sentence2treebank/sentence[@nr=$previd]';
            $nexts = 'let $nexts := root($sentence)/sentence2treebank/sentence[@nr=$nextid]';

            $return = ' return <match>{data($sentid)}||{data($prevs)} <em>{data($sentence)}</em> {data($nexts)}'
            .$returnTb.'||{string-join($ids, \'-\')}||{string-join($beginlist, \'-\')}||'.$variable_results.'</match>';

            $xquery = $for.$xpath.PHP_EOL.$tree.$sentid.$sentence.$ids.$begins.$beginlist.$text.$snr.$prev.$next.$previd.$nextid.$prevs.$nexts.$variable_declarations.$return;
        } else {
            $context_sentences =
'let $prevs := ($tree/preceding-sibling::alpino_ds[1]/sentence)
let $nexts := ($tree/following-sibling::alpino_ds[1]/sentence)';
            $return = ' return <match>{data($sentid)}||{data($prevs)} <em>{data($sentence)}</em> {data($nexts)}'.$returnTb
                .'||{string-join($ids, \'-\')}||{string-join($beginlist, \'-\')}||{$node}||{$meta}||'.$variable_results.'</match>';
            $xquery = $for.$xpath.PHP_EOL.$tree.$sentid.$sentence.$context_sentences.$regulartb.$ids.$begins.$beginlist.$meta.$variable_declarations.$return;
        }
    } else {
        $return = ' return <match>{data($sentid)}||{data($sentence)}'.$returnTb
            .'||{string-join($ids, \'-\')}||{string-join($beginlist, \'-\')}||{$node}||{$meta}||'.$variable_results.'</match>';
        $xquery = $for.$xpath.PHP_EOL.$tree.$sentid.$sentence.$regulartb.$ids.$begins.$beginlist.$meta.$variable_declarations.$return;
    }

    // Adds positioning values:; limits possible output
    $openPosition = '(';
    // Never fetch more than the search limit, not even with all
    if ($endPosIteration == 'all') {
        $closePosition = ')[position() = 1 to '.$searchLimit.']';
    } else {
        // Only fetch the given flushLimit, and increment on each iteration
        $startPosition = (($endPosIteration - 1) * $flushLimit) + 1; // position() is one-based
        $endPosition = min($searchLimit, $endPosIteration * $flushLimit);
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
    $begins = explode('-', $beginlist);

    $i = 0;
    // Instead of wrapping each individual word in a tag, merge sequences
    // of words in one <tag>...</tag>
    foreach ($words as $word) {
        if (in_array($i, $begins)) {
            $val = '';
            if (!in_array($i - 1, $begins)) {
                $val .= "<$tag>";
            }
            $val .= $words[$i];
            if (!in_array($i + 1, $begins)) {
                $val .= "</$tag>";
            }
            $words[$i] = $val;
        }
        ++$i;
    }
    $hlsentence = implode(' ', $words);
    if (isset($prev) || isset($next)) {
        $hlsentence = $prev.' '.$hlsentence.' '.$next;
    }

    return $hlsentence;
}
