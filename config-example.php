<?php

$version = "3.0.x";
$date = "month year";

function buildHomeURL()
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    return $protocol.$_SERVER['HTTP_HOST'].'/'.basename(__DIR__).'/';
}

defined('ROOT_PATH') or define('ROOT_PATH', __DIR__);
defined('HOME_PATH') or define('HOME_PATH', buildHomeURL());

// Whether or not to use an API to retrieve uploaded corpora. If empty, the corpora will need to be defined in the code.
defined('API_URL')   or define('API_URL',   '');

// === CHANGE PATH TO ALPINO DIRECTORY === //
$alpinoDirectory = ROOT_PATH."/parsers/Alpino";

// In the recursive Javascript call, how many sentences to flush each time
$flushLimit = 1;
// Global limit on the max amount of sentences returned
$resultsLimit = 500;
// Global limit on the max amount of sentences returned for analysis
$analysisLimit = 50000;

$cats = array("advp", "ahi", "ap", "conj", "cp", "detp", "du", "inf", "list", "mwu",
    "np", "oti", "pp", "ppart", "ppres", "rel", "smain", "ssub", "sv1", "svan", "ti", "top", "whq", "whrel", "whsub");

$ebsPages = array(
    'input.php' => 'Example',
    'parse.php'=> 'Parse',
    'matrix.php' => 'Matrix',
    'tb-sel.php' => 'Treebanks',
    'query.php' => 'Query',
    'results.php' => 'Results',
    'analysis.php' => 'Analysis',
);
$xpsPages = array(
    'input.php' => 'XPath',
    'tb-sel.php' => 'Treebanks',
    'results.php' => 'Results',
    'analysis.php' => 'Analysis',
);

$matrixOptions = array(
    array(
        'word' => 'token',
        'case sensitive' => 'cs',
        'lemma' => 'lemma',
    ),
    array(
      'word class' => 'pos',
      'detailed word class' => 'postag',
    ),
    array(
      'optional in search' => 'na',
      'not in search' => 'not'
    )
);

// BaseX database variables
// REST: all components with < 1mil databases
// === CHANGE MACHINE AND PORTS, AND USER AND PW BELOW (BaseX) === //
$databaseGroups = array(
  'sonar' => array(
    'REST' => array(
      'components' => array(
        'WRPEC', 'WRPEE', 'WRPEF', 'WRPEG', 'WRPEH', 'WRPEI',
        'WRPEK', 'WRPEL', 'WRPPC', 'WRPPD', 'WRPPE', 'WRPPF',
        'WRPPI', 'WRPPJ', 'WRPPK', 'WRUEA', 'WRUED', 'WRUEE',
        'WSUEA', 'WSUTB'
      ),
      'machine' => 'machinename',
      'port' => 0000
    ),
    'WRPEA' => array(
      'machine' => 'machinename',
      'port' => 0000,
      'sentences' => 4395094
    ),
    'WRPEJ' => array(
      'machine' => 'machinename',
      'port' => 0000,
      'sentences' => 1354245
    ),
    'WRPPB' =>  array(
      'machine' => 'machinename',
      'port' => 0000,
      'sentences' => 1709808
    ),
    'WRPPG' => array(
      'machine' => 'machinename',
      'port' => 0000,
      'sentences' => 14973209
    ),
    'WRPPH' => array(
      'machine' => 'machinename',
      'port' => 0000,
      'sentences' => 5475556
    )
  ),
  'cgn' => array(
    'components' => array(
      'NA', 'VA', 'NC', 'VC', 'NB', 'VB', 'ND', 'VD',
      'NE', 'VE', 'NF', 'VF', 'NG', 'VG',
      'NH', 'VH', 'VI', 'NI', 'VJ', 'NJ', 'NK', 'VK',
      'NL', 'VL', 'NM', 'VM', 'NN', 'VN',
      'NO', 'VO'
    ),
    'machine' => 'machinename',
    'port' => 0000
  ),
  'lassy' => array(
    'components' => array(
      'DPC', 'WIKI', 'WRPE', 'WRPP', 'WSU'
    ),
    'machine' => 'machinename',
    'port' => 0000
  ),
  'api' => array(
    'machine' => 'machinename',
    'port' => 0000
  ),
);

$dbuser = 'youruser';
$dbpwd = 'yourpw';
