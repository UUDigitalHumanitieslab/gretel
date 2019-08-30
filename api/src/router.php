<?php

require '../vendor/autoload.php';
require '../../config.php';
require '../../preparatory-scripts/alpino-parser.php';
require '../../preparatory-scripts/xpath-generator.php';
require './results.php';
require './configured-treebanks.php';
require './show-tree.php';
require './treebank-counts.php';

// Maybe change this?
header('Access-Control-Allow-Origin: *');

$base = $_SERVER['REQUEST_URI'];
$base = explode('/router.php/', $_SERVER['REQUEST_URI'])[0].'/router.php';
$router = new AltoRouter();
$router->setBasePath($base);

$router->map('OPTIONS', '@.*', function () {
    header('Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE');
    header('Access-Control-Allow-Headers: Content-Type'); // allow all mime-types for content-type
    return;
});

$router->map('GET', '/configured_treebanks', function () {
    header('Content-Type: application/json');
    echo json_encode(getConfiguredTreebanks());
});

$router->map('POST', '/generate_xpath', function () {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $xml = $data['xml'];
    $tokens = $data['tokens'];
    $attributes = $data['attributes'];
    $ignore_top_node = $data['ignoreTopNode'];
    $respect_order = $data['respectOrder'];

    $generated = generate_xpath($xml, $tokens, $attributes, $ignore_top_node, $respect_order);
    header('Content-Type: application/json');
    echo json_encode($generated);
});

$router->map('GET', '/parse_sentence/[*:sentence]', function ($sentence) {
    try {
        $xml = alpino(str_replace(
            '_SLASH_',
            '/',
            urldecode($sentence)), 'ng'.time());
        header('Content-Type: application/xml');
        echo $xml;
    } catch (Exception $e) {
        http_response_code(500);
        die($e->getMessage());
    }
});

$router->map('GET', '/tree/[*:treebank]/[*:component]/[*:sentid]', function ($treebank, $component, $sentid) {
    if (isset($_GET['db'])) {
        $database = $_GET['db'];
    } else {
        $database = $component;
    }
    showTree($sentid, $treebank, $component, $database);
});

$router->map('POST', '/metadata_counts', function () {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $corpus = $data['corpus'];
    $components = $data['components'];
    $xpath = $data['xpath'];

    $counts = get_metadata_counts($corpus, $components, $xpath);
    header('Content-Type: application/json');
    echo json_encode($counts);
});

$router->map('POST', '/treebank_counts', function () {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $corpus = $data['corpus'];
    $components = $data['components'];
    $xpath = $data['xpath'];

    $counts = getTreebankCounts($corpus, $components, $xpath);
    header('Content-Type: application/json');
    echo json_encode($counts);
});

$router->map('POST', '/results', function () {
    global $resultsLimit, $analysisLimit, $analysisFlushLimit, $flushLimit, $needRegularGrinded;
    isset($analysisLimit) or $analysisLimit = $resultsLimit;

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    /** @var string $xpath */            $xpath = $data['xpath'];
    /** @var bool $context */        $context = $data['retrieveContext'];
    /** @var string $corpus */          $corpus = $data['corpus'];
    /** @var int $iteration */          $iteration = $data['iteration'];
    /** @var array|null $variables */   $variables = $data['variables'];

    // The (remaining) components of this corpus to search
    // Only the first component is actually searched in this request.
    /** @var string[] $components */
    $components = $data['remainingComponents'];
    // The (remaining) databases to search for this component.
    // If this is null, retrieves all relevant databases for the component.
    // (Either grind databases, or smaller parts of the component as defined in one of the .lst files in /treebank-parts)
    // If neither is set, the component's name is assumed to also be the name of the database
    // (usually ${corpus}_ID_${component})
    // It is pingponged with the client so we can keep track where we are in the searching.
    /** @var string[]|null $databases */
    $databases = $data['remainingDatabases'] ? $data['remainingDatabases'] : getDatabases($corpus, $components[0], $xpath);

    // Some xpaths are faster on the plain data even in grinded corpora
    // This variable indicates that this is one of those edge cases.
    // If it is true, use the normal process of searching, even for grinded databases.
    // The $already and $databases variables will follow the normal conventions.
    // ($databases will contain the component names, and $already will be null).
    // (may already hFave been set true in getDatabases when this is a grinded corpus).
    $needRegularGrinded = $needRegularGrinded || (bool) $data['needRegularGrinded'];

    $flushLimit = $data['isAnalysis'] ? $analysisFlushLimit : $flushLimit;
    $searchLimit = $data['isAnalysis'] ? $analysisLimit : $resultsLimit;

    // We only search one component at a time.
    $results = getResults(
        $xpath,
        $context,
        $corpus,
        $components[0],
        $databases,
        $iteration,
            isset($data['searchLimit']) && $data['searchLimit'] < $searchLimit
            ? $data['searchLimit']
            : $searchLimit,
        $variables
    );

    if ($results['success']) {
        // append the actual search limit from the configuration
        $results['searchLimit'] = $searchLimit;
        // If done with current components (remainingDatabases finished)
        // Remove it from the list and get the databases for the next components
        if (!$results['remainingDatabases']) {
            array_shift($components);
            $results['remainingDatabases'] = $components[0] ? getDatabases($corpus, $components[0], $xpath) : array();
        }
        $results['remainingComponents'] = $components;

        $results['needRegularGrinded'] = $needRegularGrinded;
        if ($results['endPosIteration'] * $flushLimit >= $searchLimit) {
            // clear the remaining databases to signal the search of this component is done
            $results['remainingDatabases'] = array();
            $results['remainingComponents'] = array();
        }
    }

    header('Content-Type: application/json');
    echo json_encode($results);
});

// match current request url
$match = $router->match();

// call closure or throw 404 status
if ($match && is_callable($match['target'])) {
    call_user_func_array($match['target'], $match['params']);
} else {
    header($_SERVER['SERVER_PROTOCOL'].' 404 Not Found');
}
