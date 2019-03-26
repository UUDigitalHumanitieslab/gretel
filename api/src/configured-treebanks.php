<?php

function getConfiguredTreebanks()
{
    global $databaseGroups;
    $configured_treebanks = array();

    foreach ($databaseGroups as $corpus => $settings) {
        if ($corpus == 'api') {
            continue;
        }

        if (array_key_exists('components', $settings)) {
            $grinded = isGrinded($corpus);

            // probably default settings, this doesn't work anyway
            if (!$grinded && $settings['port'] == 0000) {
                continue;
            }
            $components = array();

            // NOTE: the configs are keyed by the component's title, we generate the id internally.
            foreach ($settings['components'] as $component_title) {
                $component_id = $grinded ? $component_title : strtoupper($corpus).'_ID_'.strtoupper($component_title);
                $component_description = array(
                    'id' => $component_id,
                    'title' => $component_title,
                    'description' => '',
                    'sentences' => '?',
                    'words' => '?',
                );

                if (array_key_exists('component_descriptions', $settings)) {
                    $component_descriptions = $settings['component_descriptions'];
                    if (array_key_exists($component_title, $component_descriptions)) {
                        $component_description = array_merge($component_description, $component_descriptions[$component_title]);
                    }
                }

                $components[$component_id] = $component_description;
            }

            $title = array_key_exists('fullName', $settings) ? $settings['fullName'] : $corpus;

            if (array_key_exists('production', $settings)) {
                $description = $settings['production'];
            } else {
                $description = '';
            }
            if (array_key_exists('language', $settings)) {
                $description .= ' '.$settings['language'];
            }
            if (array_key_exists('version', $settings)) {
                $description .= ' - version '.$settings['version'];
            }
            $metadata = array_key_exists('metadata', $settings) ? $settings['metadata'] : array();
            if (array_key_exists('multioption', $settings)) {
                $multioption = $settings['multioption'];
            } else {
                $multioption = false;
            }
            $corpus_definition = array(
                'title' => $title,
                'description' => $description,
                'components' => $components,
                'metadata' => $metadata,
                'multioption' => $multioption,
            );

            if (array_key_exists('groups', $settings)) {
                $corpus_definition['groups'] = $settings['groups'];
            }

            if (array_key_exists('variants', $settings)) {
                $corpus_definition['variants'] = $settings['variants'];
            }

            $configured_treebanks[$corpus] = $corpus_definition;
        }
    }

    return $configured_treebanks;
}
