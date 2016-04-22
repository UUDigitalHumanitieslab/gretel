#!/usr/bin/perl

# QuerySonar.pl

# script looks up XPath expression in BaseX database

# version 1.5 date: 31.10.2014  RELEASED WITH GrETEL2.0
# written by Vincent Vandeghinste & Liesbeth Augustinus (c) 2014
# for the GrETEL2.0 project

#########################################################################

# argument 1 = XPath expression, e.g. //node[@cat="np" and node[@rel="det" and @pt="lid" and @lemma="een"] and node[@rel="hd" and @pt="n"]]
# argument 2 = database name (bf-format), e.g. WRPEFnpdet%lid_hd%n

# Documentation: http://docs.basex.org/wiki/Clients

$version='1.5';

use FindBin qw($Bin); # from CPAN
require "$Bin/BaseXClient.pm";
require "$Bin/../config/config.pm";

use warnings;

$|=1; # flush every print

# PARAMETERS (defined in config.pm)
our $showhits;
our @basexpaths;
our %dbname_server;

my $xpath=shift(@ARGV); # get XPath expression
my $db=shift(@ARGV); # get db name
my ($component)=$db=~/^([A-Z]{5})/;
my $includes;
my $hitscounter=0; # set counters
my %ms_counter;
my $mshits_counter=0;
my @cat=qw(advp ahi ap conj cp detp du inf list mwu np oti pp ppart ppres rel smain ssub sv1 svan ti top whq whrel whsub);

if ($db=~/ALL/) {
    foreach(@cat){
	$dbcopy=$db;
	$dbcopy=~s/ALL/$_/;
	push(@$includes,$dbcopy);
    }
}

else {
    $includes=[$db];
}

# create session

my $dbhost=$dbname_server{$component};

my $session = Session->new($dbhost, 1950, "admin", "admin"); # connect to BaseX database

# get results
while (@$includes) {
    ($ms_ref,$includes)=&QuerySonar($xpath,$includes);
    my %matching_sentences = %$ms_ref; # dereference

    if (keys %matching_sentences) {
	foreach(keys %matching_sentences) {
	    my $sid=$_;
	    print STDERR $sid."\t".$matching_sentences{$sid}."\t".$match_counter{$sid}."\t".$tbdb{$sid}."\t".$idlist{$sid}."\t".$beginlist{$sid}."\n";
	}
    }
    print "$hitscounter\n"; # HITS
}

$mscount = keys %match_counter;
if ($mscount!=0) {
    $average = $mshits_counter/$mscount;
    print STDERR  "SAMPLE\t$mshits_counter\t$mscount\t$average\n";
}

else {
    print STDERR  "SAMPLE\t0\t0\t0\n\n";
}

# close session
$session->close();
print "__END__\n";

sub QuerySonar {
    my ($xpath,$includes)=@_;
    my $db=shift(@$includes);
    if ($ALREADY{$db}) {
	# print STDERR "Double include detected\n";
	return ({},$includes); # return empty hash reference as first argument
    }
    $ALREADY{$db}=1;
   # print STDERR "Querying $db\n";

    my @matching_sentences;
    my %matching_sentences=();

    # GET INCLUDES
    $xq="/treebank/include";

    my $flag2=undef;
    foreach (@basexpaths) {
	if (-e "$_/$db") {  # check for existence
	    $flag2=1;
	    last;
	}
    }
    if ($flag2) {

    my $xqinclude='db:open("'.$db.'")'.$xq;
    my $query = $session->query($xqinclude);

    $basexinclude=$query->execute();
    @basexinclude=split(/\n/,$basexinclude);

    # close query
    $query->close();
    }

    foreach (@basexinclude) {
	chomp;
	($file)=/file=\"(.+)\"/;
	push(@$includes,$file);
    }

    # GET SENTENCES (SAMPLE)

    my $position = ')[position() = 1 to 10]';
    my $var='declare variable $xp := (db:open("'.$db.'")'; # database name
    my $xp='/treebank/tree'.$xpath.');';
    my $lim='declare variable $xplim := (subsequence(db:open("'.$db.'")/treebank/tree'.$xpath.",1,$showhits));";
    my $nl='declare variable $nl := "&#10;";'; # newline character
    my $opentag="(<results>";
    my $hits='{let $h := (count(for $node in $xp return $node)) return concat($nl,"HITS:",$h,$nl)}'; # count matches
    my $sents='{
  (: return matching sentence IDs + node IDs :)
for $node in $xplim
let $sentid := ($node/ancestor::tree/@id)
let $begin := ($node//@begin)
let $idlist := ($node//@id)
let $beginlist := (distinct-values($begin))

return
for $sentence in (db:open("sentence2treebank")/sentence2treebank/sentence[@nr=$sentid])
    let $tb := ($sentence/@part)
return
(<match>{data($sentid)}#||#{data($tb)}#||#{string-join($idlist, "-")}#||#{string-join($beginlist, "-")}#||#{data($sentence)}</match>
)}';
    my $closetag="</results>";

    my $input = $var.$xp.$lim.$nl.$opentag.$hits.$sents.$closetag.$position; # xquery
    my $querysent = $session->query($input);
    my $flag=undef;
    foreach (@basexpaths) {
	if (-e "$_/$db") {   # check for existence
	    $flag=1;
	    last;
	}
    }
    if ($flag) {
	$basexoutput=$querysent->execute();

	@basexoutput=split(/\n/,$basexoutput);
	foreach (@basexoutput) {
	}

	$querysent->close();

	if (@basexoutput>0) {
	    foreach (@basexoutput) {
		($newhits)=/HITS:(\d+)/;
		if ($newhits) {
		    $hitscounter+=$newhits;
		    $showhits-=$newhits;
		    if ($showhits<0) {
			$showhits=0;
		    }
		}

		    ($match)=/<match>(.+)<\/match>/;
		if ($match) {
		   my ($sid,$tb,$ids,$begins,$s)=split(/#\|\|#/,$match);
		    $match_counter{$sid}++;
		    $mshits_counter++;
		    $matching_sentences{$sid}=$s;

		    $tbdb{$sid}=$tb;
		    if ($idlist{$sid}) {
			$idlist{$sid}.='-'.$ids;
		    }
		    else {
			$idlist{$sid}=$ids;
		    }
		    if ($beginlist{$sid}) {
			$beginlist{$sid}.='-'.$begins;
		    }
		    else {
			$beginlist{$sid}=$begins;
		    }

		}
	    }
	}
    }

    return (\%matching_sentences,$includes);
}
