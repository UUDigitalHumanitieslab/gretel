<?php

// require ROOT_PATH."/helpers.php";
// require ROOT_PATH."/functions.php";
require ROOT_PATH.'/preparatory-scripts/prep-functions.php';

/**
 * Generates an XPATH from a parsed sentence and the matrix options.
 *
 * @param attributes Array with the interested attribute for each token
 * @param remove_top_cat Whether the top category must be removed
 * @param order Whether the order must be respected
 */
function generate_xpath($xml, $tokens, $attributes, $remove_top_cat, $order)
{
    $lpxml = simplexml_load_string($xml);

    // add info annotation matrix to alpino parse
    foreach ($tokens as $begin => $word) {
        $postword = preg_replace('/\./', '_', $word);

        if (preg_match("/([_<>\.,\?!\(\)\"\'])|(\&quot;)|(\&apos;)/", $word)) {
            $xp = $lpxml->xpath("//node[@begin='$begin']");
        } else {
            $xp = $lpxml->xpath("//node[@word='$word' and @begin='$begin']");
        }

        if (isset($attributes[$begin])) {
            $attr = $attributes[$begin];
            foreach ($xp as $x) {
                if ($attr == 'cs') {
                    $x->addAttribute('interesting', 'token');
                } elseif ($attr == 'token') {
                    $x->addAttribute('interesting', 'token');
                    $x->addAttribute('caseinsensitive', 'yes');
                } else {
                    $x->addAttribute('interesting', $attr);
                }
            }
        }
    }

    // mark tree with @interesting annotations (the properties set in the matrix for analysis)
    $marked_tree = $lpxml->asXML();

    // Remove top category?
    if ($remove_top_cat) {
        $remove = 'relcat';
    } else {
        $remove = 'rel';
    }

    $pathToRoot = ROOT_PATH;
    $escaped_marked_tree = escapeshellarg($marked_tree);
    $sub_tree = `perl -CS $pathToRoot/preparatory-scripts/get-subtree.pl $escaped_marked_tree $remove 2>&1`;

    if ($order) {
        $order = 'true';
        $_SESSION[SID]['order'] = 'on';
    } else {
        $order = 'false';
    }

    // generate XPath from sentence
    $escaped_sub_tree = escapeshellarg($sub_tree);
    $xpath = `perl -CS $pathToRoot/preparatory-scripts/xpath-generator.pl $escaped_sub_tree $order 2>&1`;
    $xpath = preg_replace('/@cat="\s+"/', '@cat', $xpath);

    // Apply case (in)sensitivity where necessary
    $xpath = applyCs($xpath);

    $results = array(
  'xpath' => $xpath,
  'markedTree' => $marked_tree,
  'subTree' => $sub_tree,
);

    return $results;
}
