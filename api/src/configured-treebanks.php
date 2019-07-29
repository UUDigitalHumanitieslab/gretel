<?php

require_once('../../treebanks/treebanks.php');

function getConfiguredTreebanks()
{
    global $treebanks;
    $configured_treebanks = array();

    /** @var TreebankInfo $treebanks */
    foreach ($treebanks as $treebank) {
        $corpus_definition = array(
            'title' => $treebank->name,
            'description' =>
                ($treebank->production).
                ($treebank->language ? ' '.$treebank->language : '').
                ($treebank->version ? ' - version '.$treebank->version : ''),
            'multioption' => $treebank->multioption,
            'metadata' => $treebank->metadata ?? array(),   // send out an empty array if not configured
            'components' => array(),                         // filled below
        );

        // Omit these from the response if they're not configured
        if (!empty($treebank->variants) && !empty($treebank->groups)) {
            $variants = array();
            $groups = array();

            foreach ($treebank->variants as $variantId => $variantInfo) {
                $variants[$variantId] = array('display' => $variantInfo['displayname']);
            }
            foreach($treebank->groups as $groupId => $groupInfo) {
                $groups[$groupId] = array('description' => $groupInfo['description']);
            }

            $corpus_definition['variants'] = $variants;
            $corpus_definition['groups'] = $groups;
        }

        // Map the components - don't expose internal info
        foreach($treebank->components as $componentInfo) {
            $component = array(
                'id' => $componentInfo->name,
                'title' => $componentInfo->displayname,
                'description' => $componentInfo->description,
                'sentences' => $componentInfo->sentences ?: '?', // replace 0 by '?'
                'words' => $componentInfo->words ?: '?',
                'disabled' => $componentInfo->disabled
            );

            // Only define these if they're configured (non-null, etc)
            if ($componentInfo->group) $component['group'] = $componentInfo->group;
            if ($componentInfo->variant) $component['variant'] = $componentInfo->variant;
            $corpus_definition['components'][$componentInfo->name] = $component;
        }

        $configured_treebanks[$treebank->name] = $corpus_definition;
    }

    return $configured_treebanks;
}
