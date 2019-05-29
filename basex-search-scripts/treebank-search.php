<?php

function getMoreIncludes($database, &$databases, &$already, $session)
{
    $xquery = 'db:open("'.$database.'")/treebank/include';
    $query = $session->query($xquery);
    $result = $query->execute();
    $query->close();

    $newIncludes = explode("\n", $result);
    $newIncludes = array_cleaner($newIncludes);

    $pattern = '/file=\"(.+)\"/';
    foreach ($newIncludes as $newInclude) {
        if (preg_match($pattern, $newInclude, $files)) {
            $file = $files[1];
            if (!includeAlreadyExists($file, $already)) {
                $databases[] = $file;
            }
        }
    }
}

function includeAlreadyExists($include, &$already)
{
    if (isset($already[$include])) {
        return true;
    } else {
        $already[$include] = 1;

        return false;
    }
}

function corpusToDatabase($components, $corpus, $xpath)
{
    if (isGrinded($corpus)) {
        $bf = xpathToBreadthFirst($xpath);
        // Get correct databases to start search with also sets
        // $needRegularGrinded
        return checkBfPattern($corpus, $bf, $components);
    }

    return $components;
}

/**
 * @param $variables An array with variables to return. Each element should contain name and path.
 */
function getSentences($corpus, $databases, $components, &$already, $endPosIteration, $session, $sid, $searchLimit, $xpath, $context, $variables = null)
{
    global $flushLimit, $needRegularGrinded;

    $xquery = 'N/A';
    try {
        $matchesAmount = 0;

        while ($database = array_pop($databases)) {
            if (isGrinded($corpus) && !$needRegularGrinded) {
                getMoreIncludes($database, $databases, $already, $session);
            }
            while (1) {
                if ($endPosIteration !== 'all') {
                    ++$endPosIteration;
                }

                $xquery = createXquery($database, $endPosIteration, $searchLimit, $flushLimit, $needRegularGrinded, $corpus, $components, $context, $xpath, $variables);
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
                            $sentenceDatabases[$sentid] = $components[0];
                        } else {
                            $sentenceDatabases[$sentid] = $database;
                        }
                    }
                }
                if ($endPosIteration === 'all') {
                    break;
                } elseif ($matchesAmount >= $flushLimit) {
                    // Re-add pop'd database because it is very likely we aren't finished with it
                    // More results are still in that database but because of the flushlimit we
                    // have to bail out
                    $databases[] = $database;

                    break 2;
                }
            }
        }

        if (isset($sentences)) {
            if (!isGrinded($corpus)) {
                $tblist = false;
            }

            return array(
                success => true,
                sentences => $sentences,
                tblist => $tblist,
                idlist => $idlist,
                beginlist => $beginlist,
                xmllist => $xmllist,
                metalist => $metalist,
                varlist => $varList,
                endPosIteration => $endPosIteration,
                databases => $databases,
                sentenceDatabases => $sentenceDatabases,
                xquery => $xquery, );
        } else {
            // in case there are no results to be found
            return array(success => false, xquery => $xquery);
        }
    } catch (Exception $e) {
        // allow a developer to directly debug this query (log is truncated)
        echo $xquery;
        http_response_code(500);
        die;
    }
}

function createXquery($database, $endPosIteration, $searchLimit, $flushLimit, $needRegularGrinded, $corpus, $grindedComponents, $context, $xpath, $variables)
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
    for $sentence in (db:open("'.$grindedComponents[0].'sentence2treebank")/sentence2treebank/sentence[@nr=$sentid])
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
            $databases = $grindedComponents[0].'sentence2treebank';

            $text = 'let $text := fn:replace($sentid[1], \'(.+?)(\d+)$\', \'$1\')';
            $snr = 'let $snr := fn:replace($sentid[1], \'(.+?)(\d+)$\', \'$2\')';
            $prev = 'let $prev := (number($snr)-1)';
            $next = 'let $next := (number($snr)+1)';
            $previd = 'let $previd := concat($text, $prev)';
            $nextid = 'let $nextid := concat($text, $next)';

            $prevs .= '/sentence2treebank/sentence[@nr=$previd])';
            $nexts .= '/sentence2treebank/sentence[@nr=$nextid])';

            $return = ' return <match>{data($sentid)}||{data($prevs)} <em>{data($sentence)}</em> {data($nexts)}'
            .$returnTb.'||{string-join($ids, \'-\')}||{string-join($beginlist, \'-\')}||'.$variable_results.'</match>';

            $xquery = $for.$xpath.PHP_EOL.$tree.$sentid.$sentence.$ids.$begins.$beginlist.$text.$snr.$prev.$next.$previd.$nextid.$prevs.$nexts.$variable_declarations.$return;
        } else {
            $context_sentences = 'let $prevs := ($tree/preceding-sibling::alpino_ds[1]/sentence)
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

function getRegularGrinded($component)
{
    $databases = file(ROOT_PATH."/treebank-parts/$component.lst", FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    return $databases;
}
