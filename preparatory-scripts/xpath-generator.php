<?php

require ROOT_PATH . '/preparatory-scripts/prep-functions.php';

function exec_args($command, $args)
{
    $output = null;
    $return_var = null;

    $escaped_args = array_map(function ($arg) {
        return escapeshellarg($arg);
    }, $args);

    $command .= ' ' . implode(' ', $escaped_args);

    exec($command, $output, $return_var);
    if ($return_var != 0) {
        http_response_code(500);
        echo $command;
        echo $return_var;
        exit($output);
    }

    return implode('\n', $output);
}

/**
 * Generates an XPATH from a parsed sentence and the matrix options.
 *
 * @param attributes Array with the interested attribute for each token
 * @param remove_top_cat Whether the top category must be removed
 * @param order Whether the order must be respected
 */
function generate_xpath($xml, $tokens, $attributes, $remove_top_cat, $order)
{
    // Remove top category?
    if ($remove_top_cat) {
        $remove = 'relcat';
    } else {
        $remove = 'rel';
    }

    $marked_tree = exec_args(
        'alpino-query',
        ['mark', $xml, implode(' ', $tokens), implode(' ', $attributes)]
    );

    $sub_tree = exec_args(
        'alpino-query',
        ['subtree', $marked_tree, $remove]
    );

    $xpath = exec_args(
        'alpino-query',
        ['xpath', $sub_tree, $order ? 1 : 0]
    );

    $results = [
        'xpath' => $xpath,
        'markedTree' => $marked_tree,
        'subTree' => $sub_tree,
    ];

    return $results;
}
