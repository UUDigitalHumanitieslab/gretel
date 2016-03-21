#!/usr/bin/perl

# config.pm

# Parameters for QuerySonar.pl

use warnings;

our $showhits=100;
our @basexpaths=("/path/to/BaseX1/", "/path/to/BaseX2/","/path/to/BaseX3/","/path/to/BaseX4/");

our %dbname_server=('WRPEA' => 'machine1',
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

1;
