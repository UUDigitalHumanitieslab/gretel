<?php
// GrETEL 2.0 home URL
$home="http://gretel.ccl.kuleuven.be/gretel-lies";

// GrETEL 2.0 home directory
$root="/home/paco/web/gretel/gretel-lies";

$version="2.0.2";

// paths to other directories
$tmp="$root/tmp"; // tmp dir
$log="$root/log"; // log dir
$scripts="$root/scripts"; // scripts dir

$config="$root/config"; 

 // Alpino parser location
$alpinoHome = "$root/parsers/Alpino";
// Location to the Alpino parse trees
$alpinoTreebank = "$root/tmp";

// BaseX database variables (LASSY and CGN)
$dbhost="asterix";
$dbport="1984";
$dbuser="admin";
$dbpwd="admin";

// BaseX database variables (SoNaR): component => host

$dbname_server=array('WRPEA' => 'gobelijn',
		     'WRPEC' => 'gobelijn',
		     'WRPEE' => 'gobelijn',
		     'WRPEF' => 'gobelijn',
		     'WRPEG' => 'gobelijn',
		     'WRPEH' => 'gobelijn',
		     'WRPEI' => 'gobelijn',
		     'WRPEJ' => 'gobelijn',
		     'WRPEK' => 'gobelijn',
		     'WRPEL' => 'gobelijn',
		     'WRPPB' => 'obelix',
		     'WRPPC' => 'obelix',
		     'WRPPD' => 'obelix',
		     'WRPPE' => 'obelix',
		     'WRPPF' => 'obelix',
		     'WRPPH' => 'obelix',
		     'WRPPG' => 'wiske',
		     'WRPPI' => 'donald',
		     'WRPPJ' => 'donald',
		     'WRPPK' => 'donald',
		     'WRUEA' => 'donald',
		     'WRUED' => 'donald',
		     'WRUEE' => 'donald',
		     'WSUEA' => 'donald',
		     'WSUTB' => 'donald',
		     );


$dbport2="1950";
$dbuser2="admin";
$dbpwd2="admin";

?>