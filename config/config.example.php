<?php
// GrETEL 2.0 home URL
$home="http://localhost/gretel-2.0";

// GrETEL 2.0 home directory
$root="/path/to/gretel/gretel-2.0";


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
$dbhost="dbhost";
$dbport="dbpart";
$dbuser="dbuser";
$dbpwd="dbpwd";

// BaseX database variables (SoNaR): component => host

$dbname_server=array('WRPEA' => 'machine1',
		     'WRPEC' => 'machine1',
		     'WRPEE' => 'machine1',
		     'WRPEF' => 'machine1',
		     'WRPEG' => 'machine1',
		     'WRPEH' => 'machine1',
		     'WRPEI' => 'machine1',
		     'WRPEJ' => 'machine1',
		     'WRPEK' => 'machine1',
		     'WRPEL' => 'machine1',
		     'WRPPB' => 'machine3',
		     'WRPPC' => 'machine3',
		     'WRPPD' => 'machine3',
		     'WRPPE' => 'machine3',
		     'WRPPF' => 'machine3',
		     'WRPPH' => 'machine3',
		     'WRPPG' => 'machine4',
		     'WRPPI' => 'machine2',
		     'WRPPJ' => 'machine2',
		     'WRPPK' => 'machine2',
		     'WRUEA' => 'machine2',
		     'WRUED' => 'machine2',
		     'WRUEE' => 'machine2',
		     'WSUEA' => 'machine2',
		     'WSUTB' => 'machine2',
		     );


$dbport2="dbport2";
$dbuser2="dbuser2";
$dbpwd2="dbpwd2";

?>