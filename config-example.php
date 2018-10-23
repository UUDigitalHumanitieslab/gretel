<?php

function buildHomeURL()
{
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? 'https://' : 'http://';

    return $protocol.$_SERVER['HTTP_HOST'].'/'.basename(__DIR__).'/';
}

defined('ROOT_PATH') or define('ROOT_PATH', __DIR__);
defined('HOME_PATH') or define('HOME_PATH', buildHomeURL());

// Whether or not to use an API to retrieve uploaded corpora. If empty, the corpora will need to be defined in the code.
defined('API_URL') or define('API_URL', '');

// === ALPINO SERVER  MODE ===
// Whether or not to use alpino-server instead of starting a local instance
$alpinoServerMode = false;
$alpinoServerAddress = '';
$alpinoServerPort = 0;

// === ALPINO SERVER  MODE ===
// set to 1 when using alpino in server modus
$alpinoServerMode = 1;
$alpinoServerAddress = 'url port';

// === CHANGE PATH TO ALPINO DIRECTORY === //
// Only when $alpinoServerMode = false
$alpinoDirectory = ROOT_PATH.'/parsers/Alpino';

// In the recursive Javascript call, how many sentences to flush each time
$flushLimit = 50;
// Global limit on the max amount of sentences returned
$resultsLimit = 500;
// Global limit on the max amount of sentences returned for analysis
$analysisLimit = 50000;
$analysisFlushLimit = 500;

$cats = array('advp', 'ahi', 'ap', 'conj', 'cp', 'detp', 'du', 'inf', 'list', 'mwu',
    'np', 'oti', 'pp', 'ppart', 'ppres', 'rel', 'smain', 'ssub', 'sv1', 'svan', 'ti', 'top', 'whq', 'whrel', 'whsub', );

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
      'not in search' => 'not',
    ),
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
        'WSUEA', 'WSUTB',
      ),
      'machine' => 'machine',
      'port' => 0000,
    ),
    'WRPEA' => array(
      'machine' => 'machine',
      'port' => 0000,
      'sentences' => 4395094,
    ),
    'WRPEJ' => array(
      'machine' => 'machine',
      'port' => 0000,
      'sentences' => 1354245,
    ),
    'WRPPB' => array(
      'machine' => 'machine',
      'port' => 0000,
      'sentences' => 1709808,
    ),
    'WRPPG' => array(
      'machine' => 'suske',
      'port' => 0000,
      'sentences' => 14973209,
    ),
    'WRPPH' => array(
      'machine' => 'machine',
      'port' => 0000,
      'sentences' => 5475556,
    ),
    'fullName' => 'SoNaR',
    'version' => '1.0',
    'production' => 'written',
    'language' => 'Dutch',
    'multioption' => false,
  ),
  'cgn' => array(
    'groups' => array(
      'A' => array('description' => "Spontaneous conversations ('face-to-face')"),
      'B' => array('description' => 'Interviews with teachers of Dutch'),
      'C' => array('description' => 'Telephone conversations (recorded via a switchboard)'),
      'D' => array('description' => 'Telephone conversations (recorded on MD)'),
      'E' => array('description' => 'Simulated business negotiations'),
      'F' => array('description' => 'Interviews/discussions/debates (broadcast)'),
      'G' => array('description' => '(Political) discussions/debates/meetings (non-broadcast)'),
      'H' => array('description' => 'Lessons recorded in the classroom'),
      'I' => array('description' => 'Live (sports) commentaries (broadcast)'),
      'J' => array('description' => 'Newsreports (broadcast)'),
      'K' => array('description' => 'News (broadcast)'),
      'L' => array('description' => 'Commentaries/columns/reviews (broadcast)'),
      'M' => array('description' => 'Ceremonious speeches/sermons'),
      'N' => array('description' => 'Lectures/seminars'),
      'O' => array('description' => 'Read speech'),
    ),
    'variants' => array(
      'NL' => array('display' => 'NL'),
      'VL' => array('display' => 'VL'),
    ),
    'components' => array(
      'NA', 'VA', 'NC', 'VC', 'NB', 'VB', 'ND', 'VD',
      'NE', 'VE', 'NF', 'VF', 'NG', 'VG',
      'NH', 'VH', 'VI', 'NI', 'VJ', 'NJ', 'NK', 'VK',
      'NL', 'VL', 'NM', 'VM', 'NN', 'VN',
      'NO', 'VO',
    ),
    'component_descriptions' => array(
      'NA' => array(
        'sentences' => 50239,
        'words' => 302828,
        'group' => 'A',
        'variant' => 'NL',
      ),
      'VA' => array(
        'sentences' => 22881,
        'words' => 147418,
        'group' => 'A',
        'variant' => 'VL',
      ),
      'NB' => array(
        'sentences' => 2484,
        'words' => 25724,
        'group' => 'B',
        'variant' => 'NL',
      ),
      'VB' => array(
        'sentences' => 4289,
        'words' => 34158,
        'group' => 'B',
        'variant' => 'VL',
      ),
      'NC' => array(
        'sentences' => 11649,
        'words' => 70084,
        'group' => 'C',
        'variant' => 'NL',
      ),
      'VC' => array(
        'sentences' => 3142,
        'words' => 19984,
        'group' => 'C',
        'variant' => 'VL',
      ),
      'ND' => array(
        'sentences' => 0,
        'words' => 0,
        'group' => 'D',
        'variant' => 'NL',
        'disabled' => true,
      ),
      'VD' => array(
        'sentences' => 929,
        'words' => 6309,
        'group' => 'D',
        'variant' => 'VL',
      ),
      'NE' => array(
        'sentences' => 3123,
        'words' => 25524,
        'group' => 'E',
        'variant' => 'NL',
      ),
      'VE' => array(
        'sentences' => 0,
        'words' => 0,
        'group' => 'E',
        'variant' => 'VL',
        'disabled' => true,
      ),
      'NF' => array(
        'sentences' => 6290,
        'words' => 75167,
        'group' => 'F',
        'variant' => 'NL',
      ),
      'VF' => array(
        'sentences' => 2617,
        'words' => 25122,
        'group' => 'F',
        'variant' => 'VL',
      ),
      'NG' => array(
        'sentences' => 1166,
        'words' => 25125,
        'group' => 'G',
        'variant' => 'NL',
      ),
      'VG' => array(
        'sentences' => 543,
        'words' => 9009,
        'group' => 'G',
        'variant' => 'VL',
      ),
      'NH' => array(
        'sentences' => 3064,
        'words' => 26004,
        'group' => 'H',
        'variant' => 'NL',
      ),
      'VH' => array(
        'sentences' => 1395,
        'words' => 10116,
        'group' => 'H',
        'variant' => 'VL',
      ),
      'VI' => array(
        'sentences' => 1026,
        'words' => 10147,
        'group' => 'I',
        'variant' => 'VL',
      ),
      'NI' => array(
        'sentences' => 2251,
        'words' => 25002,
        'group' => 'I',
        'variant' => 'NL',
      ),
      'VJ' => array(
        'sentences' => 536,
        'words' => 7686,
        'group' => 'J',
        'variant' => 'VL',
      ),
      'NJ' => array(
        'sentences' => 2259,
        'words' => 25084,
        'group' => 'J',
        'variant' => 'NL',
      ),
      'NK' => array(
        'sentences' => 1923,
        'words' => 25353,
        'group' => 'K',
        'variant' => 'NL',
      ),
      'VK' => array(
        'sentences' => 558,
        'words' => 7306,
        'group' => 'K',
        'variant' => 'VL',
      ),
      'NL' => array(
        'sentences' => 1857,
        'words' => 25082,
        'group' => 'L',
        'variant' => 'NL',
      ),
      'VL' => array(
        'sentences' => 601,
        'words' => 7431,
        'group' => 'L',
        'variant' => 'VL',
      ),
      'NM' => array(
        'sentences' => 444,
        'words' => 5190,
        'group' => 'M',
        'variant' => 'NL',
      ),
      'VM' => array(
        'sentences' => 107,
        'words' => 1894,
        'group' => 'M',
        'variant' => 'VL',
      ),
      'NN' => array(
        'sentences' => 593,
        'words' => 14921,
        'group' => 'N',
        'variant' => 'NL',
      ),
      'VN' => array(
        'sentences' => 701,
        'words' => 8159,
        'group' => 'N',
        'variant' => 'VL',
      ),
      'NO' => array(
        'sentences' => 0,
        'words' => 0,
        'group' => 'O',
        'variant' => 'NL',
        'disabled' => true,
      ),
      'VO' => array(
        'sentences' => 3256,
        'words' => 44144,
        'group' => 'O',
        'variant' => 'VL',
      ),
    ),
    'machine' => 'machine',
    'port' => 0000,
    'fullName' => 'Corpus Gesproken Nederlands',
    'version' => '2.0.1',
    'production' => 'spoken',
    'language' => 'Dutch',
    'multioption' => true,
  ),
  'lassy' => array(
    'title' => 'LASSY Small',
    'description' => 'written Dutch - version 1.1',
    'components' => array(
      'DPC', 'WIKI', 'WRPE', 'WRPP', 'WSU',
    ),
    'component_descriptions' => array(
      'DPC' => array(
        'description' => 'Dutch Parallel Corpus',
        'sentences' => 11716,
        'words' => 193029,
      ),
      'WIKI' => array(
        'title' => 'Wikipedia',
        'description' => 'Dutch Wikipedia pages',
        'sentences' => 7341,
        'words' => 83360,
      ),
      'WRPE' => array(
        'title' => 'WR-P-E',
        'description' => 'E-magazines, newsletters, teletext pages, web sites, Wikipedia',
        'sentences' => 14420,
        'words' => 232631,
      ),
      'WRPP' => array(
        'title' => 'WR-P-P',
        'description' => 'Books, brochures, guides and manuals, legal texts, newspapers, periodicals and magazines, policy documents, proceedings, reports, surveys',
        'sentences' => 17691,
        'words' => 281424,
      ),
      'WSU' => array(
        'title' => 'WS-U',
        'description' => 'Auto cues, news scripts, text for the visually impaired',
        'sentences' => 14032,
        'words' => 184611,
      ),
    ),
    'metadata' => array(
      // array(
      // 'field' => /* name of the field */,
      // 'type' => 'text' | 'int' | 'date',
      // 'facet' => 'checkbox' | 'slider' | 'range' | 'dropdown',
      // 'show' => boolean,
      // 'minValue' => int | Date | NULL,
      // 'maxValue' => int | Date | NULL)
    ),
    'machine' => 'machine',
    'port' => 0000,
    'fullName' => 'LASSY Small',
    'version' => '1.1',
    'production' => 'written',
    'language' => 'Dutch',
    'multioption' => true,
  ),
  'api' => array(
    'machine' => 'machine',
    'port' => 0000,
    'fullName' => 'LASSY Small',
    'version' => '1.1',
    'production' => 'written',
    'language' => 'Dutch',
    'multioption' => true,
  ),
);

$dbuser = 'youruser';
$dbpwd = 'yourpw';
