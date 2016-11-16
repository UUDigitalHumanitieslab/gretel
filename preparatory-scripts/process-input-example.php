<?php
session_start();

require '../config/config.php';
require "$root/helpers.php";
require "$root/functions.php";
require "$root/preparatory-scripts/prep-functions.php";

$id = session_id();

$lpxml = simplexml_load_file("$tmp/$id-pt.xml");

// Set tokenized input sentence to variable
$tokinput = $_SESSION['sentence'];
$sentence = explode(' ', $tokinput);
  // add info annotation matrix to alpino parse
foreach ($sentence as $begin => $word) {
    $postword = preg_replace('/\./', '_', $word);

    if (preg_match("/([_<>\.,\?!\(\)\"\'])|(\&quot;)|(\&apos;)/", $word)) {
        $xp = $lpxml->xpath("//node[@begin='$begin']");
    } else {
        $xp = $lpxml->xpath("//node[@word='$word' and @begin='$begin']");
    }

    if (isset($_POST["$postword--$begin"])) {
        $postvalue = $_POST["$postword--$begin"];
        foreach ($xp as $x) {
            $x->addAttribute('interesting', $postvalue);
            if ($postvalue == 'token' && !isset($_POST["$postword--$begin-case"])) {
              $x->addAttribute('caseinsensitive', 'yes');
            }
        }
    }
}
// save parse with @interesting annotations
$treefileName = "$tmp/$id-int.xml";
if (file_exists($treefileName)) {
    unlink($treefileName);
}
$tree = $lpxml->asXML();

$treeFh = fopen($treefileName, 'w');
fwrite($treeFh, "$tree\n");
fclose($treeFh);

// Remove top category?
if (isset($_POST['topcat'])) {
    $remove = 'relcat';
} else {
    $remove = 'rel';
}

`perl -CS $root/preparatory-scripts/get-subtree.pl $tmp/$id-int.xml $remove > $tmp/$id-sub.xml`;

if (isset($_POST['order'])) {
    $order = 'true';
    $_SESSION['order'] = 'on';
} else {
    $order = 'false';
}

// generate XPath from sentence
$xpath = `perl -CS $root/preparatory-scripts/xpath-generator.pl $tmp/$id-sub.xml $order`;
$xpath = preg_replace('/@cat="\s+"/', '@cat', $xpath);

// Apply case (in)sensitivity where necessary
$xpath = applyCs($xpath);
$_SESSION['xpath'] = $xpath;

session_write_close();

$results = array(
  'location' => "tmp/$id-sub.xml",
  'xpath' => $xpath,
);

echo json_encode($results);
