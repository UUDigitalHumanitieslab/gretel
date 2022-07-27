<?php

function generate_mwe_queries($canonical, $parsed) {
    $stderr = fopen('php://stderr', 'w');
    fwrite($stderr, "got mwe parse from alpino: $parsed");

    return [
        ['description' => 'everything', 'xpath' => '//node'],
        ['description' => 'near miss (still everything)', 'xpath' => '//node'],
        ['description' => 'superset (still everything)', 'xpath' => '//node'],
    ];
}

function canonical_mwe_view() {
    echo json_encode([
        'this is one expression',
        'this is another expression',
        'this is great'
    ]);
}

function generate_mwe_view() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $canonical = $data['canonical'];
    $parsed = alpino($canonical, 'mwe'.time());

    $generated = generate_mwe_queries($canonical, $parsed);
    header('Content-Type: application/json');
    echo json_encode($generated);
}

?>
