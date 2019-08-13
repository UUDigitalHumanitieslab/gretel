<?php

function buildHomeURL()
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';

    return $protocol.$_SERVER['HTTP_HOST'].'/'.basename(__DIR__).'/';
}

defined('ROOT_PATH') or define('ROOT_PATH', __DIR__);
defined('HOME_PATH') or define('HOME_PATH', buildHomeURL());

// === GRETEL-UPLOAD ===
// Whether or not to use an API to retrieve uploaded corpora. If empty, uploaded corpora will be unreachable.
// defined('API_URL') or define('API_URL', 'http:localhost/gretel-upload/index.php/api/');
// defined('API_BASEX_INFO') or define ('API_BASEX_INFO', array(
//     'machine'   => 'localhost',
//     'port'      => 1984,
//     'username'  => 'admin',
//     'password'  => 'admin'
// ));

// === ALPINO SERVER MODE ===
// Whether or not to use alpino-server instead of starting a local instance
$alpinoServerMode = false;
$alpinoServerAddress = '';
$alpinoServerPort = 0;

// === CHANGE PATH TO ALPINO DIRECTORY ===
// Only when $alpinoServerMode = false
$alpinoDirectory = ROOT_PATH.'/parsers/Alpino';

// In the recursive Javascript call, how many sentences to flush each time
$flushLimit = 50;
// Global limit on the max amount of sentences returned (per searched component)
$resultsLimit = 500;
// Global limit on the max amount of sentences returned for analysis
$analysisLimit = 50000;
$analysisFlushLimit = 500;

// Used for Grinded search
$cats = array('advp', 'ahi', 'ap', 'conj', 'cp', 'detp', 'du', 'inf', 'list', 'mwu',
    'np', 'oti', 'pp', 'ppart', 'ppres', 'rel', 'smain', 'ssub', 'sv1', 'svan', 'ti', 'top', 'whq', 'whrel', 'whsub', );
