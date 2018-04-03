<?php
require '../vendor/autoload.php';
require '../../preparatory-scripts/alpino-parser.php';

// Maybe change this?
header('Access-Control-Allow-Origin: *');

$router = new AltoRouter();
$router->setBasePath("/gretel/api/src/router.php");
$alpinoDirectory = "/opt/Alpino";
define('ROOT_PATH', "/vagrant/vagrant_data/gretel");


// Test route to show as an example (remove before merging with develop)
$router->map( 'GET', '/test_route', function() {
    $data = [
            'payload' => 'test'
    ];
    header('Content-Type: application/json');
    echo json_encode($data);
});


//
$router->map('POST', '/parse_sentence', function() {
    $sentence = $_POST['sentence'];
    //TODO: make the id random.
    $location = alpino($sentence, 1233);

    $data = [
        'file_ref' => $location
    ];

    header('Content-Type: application/json');
    echo json_encode($data);
});


// match current request url
$match = $router->match();

// call closure or throw 404 status
if( $match && is_callable( $match['target'] ) ) {
    call_user_func_array( $match['target'], $match['params'] );
} else {
        	header( $_SERVER["SERVER_PROTOCOL"] . ' 404 Not Found');
}