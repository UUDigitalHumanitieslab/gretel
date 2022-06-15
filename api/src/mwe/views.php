<?php

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
    $generated = generate_mwe_queries($canonical);
    header('Content-Type: application/json');
    echo json_encode($generated);
}

?>
