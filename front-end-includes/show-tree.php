<?php
/**
 * Looks up an XML tree in a BaseX database and prints it as a syntax tree.
 * Also adds highlights.
 *
 * This file is called when a user clicks a link on the results page. The links
 * are generated by php/flush-results.php and php/get-all-results.php and parsed
 * in js/results.js.
 *
 * @version 1.0  date: 08.30.2016  converted xml2tree.pl to PHP function
 * @version 0.5  date: 05.22.2016  removed `opt` GET. Not necessary for this build
 * @version 0.4  date: 14.10.2014  RELEASED WITH GrETEL2.0
 *
 * @author Liesbeth Augustinus
 * @author Bram Vanroy
 */
header('Content-type: text/xml');
header('Access-Control-Allow-Origin: http://localhost:4200');
set_time_limit(0);

// Set variables
if (isset($_GET['sid'])) {
    $sentid = $_GET['sid'];
}
if (isset($_GET['id'])) {
    $idstring = $_GET['id'];
}
if (isset($_GET['wd'])) {
    $wstring = $_GET['wd'];
}
if (isset($_GET['tb'])) {
    $treebank = $_GET['tb'];
}
if (isset($_GET['db'])) {
    $db = $_GET['db'];
}

require '../config.php';
require ROOT_PATH.'/helpers.php';
require ROOT_PATH.'/functions.php';
require ROOT_PATH.'/basex-search-scripts/basex-client.php';

try {
    $serverInfo;
    if ($treebank == 'sonar') {
        preg_match('/^([A-Z]{5})/', $db, $component);
        $serverInfo = getServerInfo($treebank, $component[0]);
        $queryPath = $db;
    } else {
        $serverInfo = getServerInfo($treebank, false);
        $queryPath = strtoupper($treebank);
        $queryPath .= '_ID';
    }

    $dbhost = $serverInfo['machine'];
    $dbport = $serverInfo['port'];
    $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
    $xquery = 'db:open("'.$queryPath.'")/treebank/alpino_ds[@id="'.$sentid.'"]';
    $query = $session->query($xquery);
    $xml = $query->execute();

    $query->close();
    $session->close();

    $replaceValues = array(
      '&' => '&amp;',
      "'" => '&apos;', );

    $xml = strtr($xml, $replaceValues);

    if (isset($idstring)) {
        $part = preg_replace('/(\d+)/', '@id="$1"', $idstring);
        $xpart = str_replace('-', ' or ', $part);
        $xpath = "//node[$xpart]";
    } elseif (isset($wstring)) {
        $wstring = preg_replace('/^-*|-*$/', '', $wstring);
        $part = preg_replace('/(\w+)/', '@word="$1" or @lemma="$1"', $wstring);
        $xpart = str_replace('-', ' or ', $part);
        $xpath = "//node[$xpart]";
    } else {
        $xpath = '//node[@rel="--"]';
    }

    $highlightedTree = treeHighlighter($xml, $xpath);

    echo $highlightedTree->asXML();
} catch (Exception $e) {
    echo $e->getMessage();
}

function treeHighlighter($xmlString, $xpath)
{
    $xml = new SimpleXMLElement($xmlString);

    $highlightNodes = $xml->xpath($xpath);

    if (!empty($highlightNodes)) {
        foreach ($highlightNodes as $node) {
            if (isset($node['index'])) {
                $highlightNodes = array_merge($highlightNodes, $xml->xpath('//node[@index="'.$node['index'].'"]'));
            }
        }

        foreach ($highlightNodes as $node) {
            $node->addAttribute('highlight', 'yes');
        }
    } else {
        $errorLog = fopen(ROOT_PATH.'/log/xml2tree.log', 'a');
        fwrite($errorLog, "Can't find $xpath\n");
        fclose($errorLog);

        $highlightNodes = $xml->xpath('//node[@rel="top"]');

        foreach ($highlightNodes as $node) {
            $node->addAttribute('highlight', 'yes');
        }
    }

    return $xml;
}
