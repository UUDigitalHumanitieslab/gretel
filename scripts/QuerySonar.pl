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
use warnings;

$version='1.5';

use FindBin qw($Bin); # from CPAN
use JSON::XS qw(encode_json);
require "$Bin/BaseXClient.pm";
require "$Bin/../config/config.pm";

$|=1; # flush every print

# PARAMETERS (defined in config.pm)
our @basexpaths;
our %dbname_server;

my $xpath=shift(@ARGV); # get XPath expression
my $db=shift(@ARGV); # get db name
my ($component)=$db=~/^([A-Z]{5})/;

my $resultlimit=shift(@ARGV);
my $queryIteration=shift(@ARGV);

my $startPosition = 1 + ($queryIteration * $resultlimit);
my $endPosition = $startPosition + $resultlimit;

my $hitscounter=0; # set counters
my %ms_counter;
my $mshits_counter=0;
my @cat=qw(advp ahi ap conj cp detp du inf list mwu np oti pp ppart ppres rel smain ssub sv1 svan ti top whq whrel whsub);

my $dbcopy;
my @includes = ();

if (index($db, 'ALL') != -1) {
  foreach (@cat) {
    $dbcopy = $db;
    $dbcopy =~ s/ALL/$_/;
    push(@includes, $dbcopy);
  }
}
else {
  push(@includes, $db);
  $dbcopy = $db;
}

# create session
my $dbhost=$dbname_server{$component};
my $session = Session->new($dbhost, 1950, "admin", "admin"); # connect to BaseX database

my %RESULTS = ();

%ALREADY = ();
$nrofmatches = 0;
# Loop through all current includes, keep track of current index
# Because we push to the include list in the sub QuerySonar,
# we loop through indices. This is safer than looping through an
# array that is being modified at the time of looping
INCLUDE: for (my $i = 0; $i < scalar @includes; $i++) {
  my $include = @includes->[$i];
  my $match = &QuerySonar($xpath, $include, $includes);

  if (defined $match) {
    # put matches into array and make sure each item does contain non-whitespace characters
    my @matches = grep { /\S/ } split(/<\/match>/, $match);

    foreach my $m (@matches) {
      if ($nrofmatches >= $resultlimit) {
        last INCLUDE;
      }

      $m =~ s/<match>//;
      chomp($m);
      my ($sentid, $trebank, $idlist, $beginlist, $sentence) = split(/#||#/, $m);
    }
  }
}
# close session
$session->close();

my $json = encode_json \%RESULTS;
print $json;

sub QuerySonar {
	my ($xpath, $db, $includes) = @_;
  unless ($db) {
    print STDERR "Something went wrong when querying $xpath "
      . "because the db is undefined\n";
  }

  my $dbflag = 0;
  foreach (@basexpaths) {
    if (-e "$_/$db") {
      $dbflag = 1;
      last;
    }
  }
  if ($dbflag) {
    my $xq        = '/treebank/include';
    my $xqinclude = 'db:open("' . $db . '")' . $xq;
    my $query     = $session->query($xqinclude);

    my $basexinclude  = $query->execute();
    my @basexincludes = split(/\n/, $basexinclude);

    $query->close();

    foreach (@basexincludes) {
			chomp;
			($file) = /file=["](.+)["]/;

      unless (IncludeAlreadyExists($file)) {
        push(@{$includes}, $file);
      }
		}

    # GET SENTENCES (SAMPLE)
    my $for = '(for $node in db:open("'.$db.'")/treebank/tree';
    my $sentid = 'let $sentid := ($node/ancestor::tree/@id)';
    my $ids = 'let $ids := ($node//@id)';
    my $begins = 'let $begins := ($node//@begin)';
    my $beginlist = 'let $beginlist := (distinct-values($begins))';

    my $sentence = '
return
for $sentence in (db:open("sentence2treebank")/sentence2treebank/sentence[@nr=$sentid])
    let $tb := ($sentence/@part)';
    my $return = 'return <match>{data($sentid)}#||#{data($tb)}#||#{string-join($ids, "-")}#||#{string-join($beginlist, "-")}#||#{data($sentence)}</match>';
    my $position = ')[position() = '.$startPosition.' to '.$endPosition.']';

    my $input = $for.$xpath.$sentid.$ids.$begins.$beginlist.$sentence.$return.$position;
    my $querysent = $session->query($input);

    my $queryexec = $querysent->execute();
    my @basexoutput = split(/\n/, $queryexec);

    $querysent->close();
    if (scalar @basexoutput > 0) {
      return @basexoutput;
    }
    else {
      return undef;
    }
  }
  else {
    return undef;
  }
}

sub IncludeAlreadyExists {
  my ($include) = @_;

  if ($ALREADY{$include}) {return 1;}
  else {$ALREADY{$include} = 1;}

  return 0;
}
