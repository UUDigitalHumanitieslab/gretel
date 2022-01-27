<?php

require ROOT_PATH . '/preparatory-scripts/prep-functions.php';

function exec_args($command, $args)
{
    $output = null;
    $return_var = null;

    $escaped_args = array_map(function ($arg) {
        return escapeshellarg($arg);
    }, $args);

    exec($command . ' ' . $escaped_args, $output, $return_var);
    if ($return_var != 0) {
        throw "Return value != 0";
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
    // $lpxml = simplexml_load_string($xml);

    // // add info annotation matrix to alpino parse
    // foreach ($tokens as $begin => $word) {
    //     $postword = preg_replace('/\./', '_', $word);

    //     if (preg_match("/([_<>\.,\?!\(\)\"\'])|(\&quot;)|(\&apos;)/", $word)) {
    //         $xp = $lpxml->xpath("//node[@begin='$begin']");
    //     } else {
    //         $xp = $lpxml->xpath("//node[@word='$word' and @begin='$begin']");
    //     }

    //     if (isset($attributes[$begin])) {
    //         $attr = $attributes[$begin];
    //         foreach ($xp as $x) {
    //             if ($attr == 'cs') {
    //                 $x->addAttribute('interesting', 'token');
    //             } elseif ($attr == 'token') {
    //                 $x->addAttribute('interesting', 'token');
    //                 $x->addAttribute('caseinsensitive', 'yes');
    //             } else {
    //                 $x->addAttribute('interesting', $attr);
    //             }
    //         }
    //     }
    // }

    // // mark tree with @interesting annotations (the properties set in the matrix for analysis)
    // $marked_tree = $lpxml->asXML();

    // Remove top category?
    if ($remove_top_cat) {
        $remove = 'relcat';
    } else {
        $remove = 'rel';
    }

    // $pathToRoot = ROOT_PATH;
    // $escaped_marked_tree = escapeshellarg($marked_tree);
    // $sub_tree = `perl -CS $pathToRoot/preparatory-scripts/get-subtree.pl $escaped_marked_tree $remove 2>&1`;

    // if ($order) {
    //     $order = 'true';
    // } else {
    //     $order = 'false';
    // }

    // // generate XPath from sentence
    // $escaped_sub_tree = escapeshellarg($sub_tree);
    // $xpath = `perl -CS $pathToRoot/preparatory-scripts/xpath-generator.pl $escaped_sub_tree $order 2>&1`;
    // $xpath = preg_replace('/@cat="\s+"/', '@cat', $xpath);

    // // Apply case (in)sensitivity where necessary
    // $xpath = applyCs($xpath);

    $marked_tree = exec_args('alpino-query',
        array('mark', $xml, implode(' ', $tokens), implode(' ', $attributes)));

    $sub_tree = exec_args('alpino-query',
        array('subtree', $marked_tree, $remove));

    $xpath = exec_args('alpino-query',
        array('xpath', $sub_tree, $order ? 1 : 0));

    $results = array(
        'xpath' => $xpath,
        'markedTree' => $marked_tree,
        'subTree' => $sub_tree,
    );

    return $results;
}
