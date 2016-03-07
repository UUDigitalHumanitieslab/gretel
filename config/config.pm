#!/usr/bin/perl

# config.pm

# Parameters for QuerySonar.pl

use warnings;

our $showhits=100;
our @basexpaths=("/home/wiske/Gretel/BaseX1/", "/home/wiske/Gretel/BaseX2/","/home/wiske/Gretel/BaseX3/","/home/wiske/Gretel/BaseX4/");

our %dbname_server=('WRPEA' => 'gobelijn',
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

1;
