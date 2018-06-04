<?php

require 'xpath-generator.php';
session_start();

if (!isset($_GET['sid'])) {
    $results = array(
    'error' => true,
    'data' => 'Session ID not provided. Perhaps you have disabled cookies. Please enable them.',
  );
    echo json_encode($results);
    exit;
}

define('SID', $_GET['sid']);

$lpxml = simplexml_load_string(file_get_contents(ROOT_PATH.'/tmp/'.SID.'-pt.xml'));

// Set tokenized input sentence to variable
$tokinput = $_SESSION[SID]['sentence'];
$tokens = explode(' ', $tokinput);
$attributes = array();

foreach ($tokens as $begin => $word) {
    $postword = preg_replace('/\./', '_', $word);

    if (isset($_POST["$postword--$begin"])) {
        $postvalue = $_POST["$postword--$begin"];
        $attributes[$begin] = $postvalue;
        if (isset($_POST["$postword--$begin-case"])) {
            $attributes[$begin] = 'cs';
        }
    }
}

$generated = generate_xpath(file_get_contents(ROOT_PATH.'/tmp/'.SID.'-pt.xml'), $tokens, $attributes, isset($_POST['topcat']), isset($_POST['order']));

if (isset($_POST['order'])) {
    $order = 'true';
    $_SESSION[SID]['order'] = 'on';
} else {
    $order = 'false';
}

$_SESSION[SID]['xpath'] = $generated['xpath'];

session_write_close();

$sub_tree = $generated['subTree'];
$treeFh = fopen(ROOT_PATH.'/tmp/'.SID.'-sub.xml', 'w');
fwrite($treeFh, "$sub_tree\n");
fclose($treeFh);

$results = array(
  'location' => 'tmp/'.SID.'-sub.xml',
  'xpath' => $xpath,
);

echo json_encode($results);
