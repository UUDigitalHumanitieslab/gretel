<?php

require_once('treebanks/treebanks.php');

function isGrinded($corpus)
{
    global $treebanks;
    return $treebanks[$corpus] ? $treebanks[$corpus]->grinded : false;
}

// Returns associative array containing at least the machine and the port
/**
 * Get the basex server info for this component.
 * Returned info contains the following fields:
 * ```php
 *  array(
 *      'machine' => 'localhost',
 *      'port' => 1984,
 *      'username' => 'admin',
 *      'password' => 'admin'
 *  )
 * ```
 *
 * Throws an exception if the passed component is not known for this the corpus.
 * If the component does not specify its own server, returns the corpus' fallback server.
 * If the corpus is not defined, and the gretel-upload component is active: returns the gretel-upload server data.
 *
 * @param string $corpus the corpus in which the component exists.
 * @param string|null $component the component for which to get the info, this should not contain any grinded suffixes.
 * @return array
 */
function getServerInfo($corpus, $component = null)
{
    /** @var TreebankInfo[] $treebanks */ global $treebanks;

    if (array_key_exists($corpus, $treebanks)) {
        $tb = $treebanks[$corpus];

        if ($component) {
            $comp = $tb->components[$component];
            // Component may omit server info, but still needs to exist!
            if (!$comp) {
                throw new Exception(`Unknown component $component in treebank $corpus`);
            }

            return array(
                'machine'   => isset($comp->machine) ? $comp->machine : $tb->machine,
                'port'      => isset($comp->port) ? $comp->port : $tb->port,
                'username'  => isset($comp->username) ? $comp->username : $tb->username,
                'password'  => isset($comp->password) ? $comp->password : $tb->password
            );
        } else { // component does not define its own server - use treebank's own server info
            return array(
                'machine'   => $tb->machine,
                'port'      => $tb->port,
                'username'  => $tb->username,
                'password'  => $tb->password
            );
        }
    } elseif(defined('API_BASEX_INFO') && defined('API_URL')) { // We also have the upload component active, assume the corpus exists there.
        return API_BASEX_INFO;
    } else {
        throw new Exception(`Unknown corpus $corpus`);
    }
}

// Remove false-y items and spaces-only items from array
function array_cleaner($array)
{
    $array = array_map('trim', $array);
    $array = array_filter($array);

    return $array;
}
