<?php

$version = "3.0.x";
$date = "month year";

function buildHomeURL()
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
    return $protocol.$_SERVER['HTTP_HOST'].'/'.basename(__DIR__).'/';
}

define('ROOT_PATH', __DIR__);
define('HOME_PATH', buildHomeURL());

// === ALPINO SERVER  MODE ===
// set to 1 when using alpino in server modus
$alpinoServerMode=1;
$alpinoServerAddress = 'url port';

// === CHANGE PATH TO ALPINO DIRECTORY === //
// only used when alpino is working in non-server mode
$alpinoDirectory = ROOT_PATH."/parsers/Alpino";

// In the recursive Javascript call, how many sentences to flush each time
$flushLimit = 1;
// Global limit on the max amount of sentences returned
$resultsLimit = 500;

$cats = array("advp", "ahi", "ap", "conj", "cp", "detp", "du", "inf", "list", "mwu",
    "np", "oti", "pp", "ppart", "ppres", "rel", "smain", "ssub", "sv1", "svan", "ti", "top", "whq", "whrel", "whsub");

$ebsPages = array(
    'input.php' => 'Example',
    'parse.php'=> 'Parse',
    'matrix.php' => 'Matrix',
    'tb-sel.php' => 'Treebanks',
    'query.php' => 'Query',
    'results.php' => 'Results',
);
$xpsPages = array(
    'input.php' => 'XPath',
    'tb-sel.php' => 'Treebanks',
    'results.php' => 'Results'
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
      'machine' => 'machine',
      'port' => 0000
    ),
    'WRPEA' => array(
      'machine' => 'machine',
      'port' => 0000,
      'sentences' => 4395094
    ),
    'WRPEJ' => array(
      'machine' => 'machine',
      'port' => 0000,
      'sentences' => 1354245
    ),
    'WRPPB' =>  array(
      'machine' => 'machine',
      'port' => 0000,
      'sentences' => 1709808
    ),
    'WRPPG' => array(
      'machine' => 'suske',
      'port' => 0000,
      'sentences' => 14973209
    ),
    'WRPPH' => array(
      'machine' => 'machine',
      'port' => 0000,
      'sentences' => 5475556
    ),
    'fullName' => 'SoNaR',
    'version' => '1.0',
    'production' => 'written',
    'language' => 'Dutch',
    'multioption' => false
  ),
  'cgn' => array(
    'components' => array(
      'NA', 'VA', 'NC', 'VC', 'NB', 'VB', 'ND', 'VD',
      'NE', 'VE', 'NF', 'VF', 'NG', 'VG',
      'NH', 'VH', 'VI', 'NI', 'VJ', 'NJ', 'NK', 'VK',
      'NL', 'VL', 'NM', 'VM', 'NN', 'VN',
      'NO', 'VO'
    ),
    'machine' => 'machine',
    'port' => 0000,
    'fullName' => 'Corpus Gesproken Nederlands',
    'version' => '2.0.1',
    'production' => 'spoken',
    'language' => 'Dutch',
    'multioption' => true
  ),
  'lassy' => array(
    'components' => array(
      'DPC', 'WIKI', 'WRPE', 'WRPP', 'WSU'
    ),
    'machine' => 'machine',
    'port' => 0000,
    'fullName' => 'LASSY Small',
    'version' => '1.1',
    'production' => 'written',
    'language' => 'Dutch',
    'multioption' => true
  )
);

$dbuser = 'youruser';
$dbpwd = 'yourpw';
