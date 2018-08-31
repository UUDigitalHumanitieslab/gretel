<?php

function getConfiguredTreebanks()
{
    global $databaseGroups;
    $configured_treebanks = array();

    foreach ($databaseGroups as $corpus => $settings) {
        if ($corpus != 'api') {
            if (array_key_exists('components', $settings)) {
                // probably default settings, this doesn't work anyway
                if ($settings['port'] == 0000) {
                    continue;
                }
                $components = array();

                foreach ($settings['components'] as $component_name) {
                    $component_description = array(
                        'database_id' => strtoupper($corpus).'_ID_'.strtoupper($component_name),
                        'title' => $component_name,
                        'description' => '',
                        'sentences' => '?',
                        'words' => '?',
                    );

                    if (array_key_exists('component_descriptions', $settings)) {
                        $component_descriptions = $settings['component_descriptions'];
                        if (array_key_exists($component_name, $component_descriptions)) {
                            $component_description = array_merge($component_description, $component_descriptions[$component_name]);
                        }
                    }

                    $components[$component_name] = $component_description;
                }

                $title = array_key_exists('title', $settings) ? $settings['title'] : $corpus;
                $description = array_key_exists('description', $settings) ? $settings['description'] : '';
                $metadata = array_key_exists('metadata', $settings) ? $settings['metadata'] : array();
                $configured_treebanks[$corpus] = array(
                    'title' => $title,
                    'description' => $description,
                    'components' => $components,
                    'metadata' => $metadata,
                );
            } else {
                // TODO: this is a grinded database
            }
        }
    }

    return $configured_treebanks;
}
