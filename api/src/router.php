<?php

require '../vendor/autoload.php';
require '../../config.php';
require '../../preparatory-scripts/alpino-parser.php';
require './results.php';

// Maybe change this?
header('Access-Control-Allow-Origin: *');

$router = new AltoRouter();
$router->setBasePath('/gretel/api/src/router.php');
$alpinoDirectory = '/opt/Alpino';
define('ROOT_PATH', '/vagrant/vagrant_data/gretel');

// Test route to show as an example (remove before merging with develop)
$router->map('GET', '/test_route', function () {
    $data = [
            'payload' => 'test',
    ];
    header('Content-Type: application/json');
    echo json_encode($data);
});

$router->map('POST', '/parse_sentence', function () {
    $sentence = $_POST['sentence'];
    //TODO: make the id random.
    $location = alpino($sentence, 1233);

    $data = [
        'file_ref' => $location,
    ];

    header('Content-Type: application/json');
    echo json_encode($data);
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

$router->map('POST', '/results', function () {
    global $resultsLimit;

    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $xpath = $data['xpath'];
    $context = $data['retrieveContext'];
    $corpus = $data['corpus'];
    $components = $data['components'];
    if (isset($data['variables'])) {
        $variables = $data['variables'];
    } else {
        $variables = null;
    }
    $offset = $data['offset'];

    if (!isset($analysisLimit)) {
        $analysisLimit = $resultsLimit;
    }
    $searchLimit = isset($data['isAnalysis']) && $data['isAnalysis'] === 'true' ? $analysisLimit : $resultsLimit;

    $results = getResults($xpath, $context, $corpus, $components, $offset, $searchLimit, $variables);

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
