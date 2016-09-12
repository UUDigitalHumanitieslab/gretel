#!/usr/bin/perl

# GetSubtree.pl
# Subtree finder which extracts a subtree from an Alpino XML tree

# version 1.7 date: 15.12.2014  bug fix
# version 1.6 date: 15.10.2014  RELEASED WITH GrETEL2.0
# written by Liesbeth Augustinus (c) 2014
# for the GrETEL2.0 project

#########################################################################

# argument: -xml: path to xml-tree (with @interesting attributes in the nodes that should be kept)
# options:
# -r (remove):
#     - rel: remove top rel
#     - cat: remove top cat
#     - relcat: remove top rel and top cat
#
# -m (mode):
#           - alpino (default): rel, cat, pos, root, token, begin
#           - lassy: rel, cat, pos, postag, root, token, begin
#           - cgn: rel, cat, pt, postag, lemma, token, begin
#           - sonar: rel, cat, pt, postag, lemma, token, begin
#
# -split/-s: split extended pos tags

#########################################################################

use Getopt::Long;
use XML::Twig;

my $prog = "XML Subtree Generator";
my $date = "July 31, 2013";
my $author = "Liesbeth Augustinus";
my $versionnr = "1.3";

my $refpos=&initialize;

# get command line options
GetOptions("help", "h",
           "version", "v",
	   "xml=s",
	   "m=s",
	   "split", "s",
	   "r=s",
           );

if (($opt_v) || ($opt_version)) {
    print "$prog\n";
    print "Version $versionnr\n";
    print "(c) $author, $date\n";
    exit(0);
    }

if (($opt_h) || ($opt_help)) {
    print "$prog\n";
    print "Version $versionnr\n";
    print "(c) $author, $date\n";
    print "\n";
    print "Command-line options:\n";
    print "\n";
    print "--help | -h:\tdisplays this information\n";
    print "--version | -v:\tdisplays version info\n";
    print "\n";
    print "--xml (path to) XML file\n";
    print "-m:\tmode (alpino/lassy/cgn/sonar)\n";
    print "-r:\tremove top node attribute\n";
    print "--split || -s:\tsplit extended pos tags\n";
    print "\n";
    print "The script takes one argument, i.e. a path to an XML file\n";
    print "\n";
    exit(0);
}

if (!($opt_xml)) {
    print "You need to specify an XML file with -xml.\n";
    exit(-1);
}

if ($opt_m) {
    $mode=$opt_m;
}

if (($opt_s) || ($opt_split)) {
    $split=1;
}

if ($opt_r) {
    $options=$opt_r;
}

# get XML
#my $inputxml=shift(@ARGV);
my $inputxml=$opt_xml;

my $twig=XML::Twig->new(pretty_print => 'indented');    # create the twig
$twig->parsefile("$inputxml");
my $root=$twig->root->first_child; # start at 'top' node (leave out alpino_ds node)
$tree=$twig->children;
@children=$tree->children;
$children[1]->cut;
$subtree=&process_twig($root,$refpos,$mode,$split);
$subtree=&cut_unary($subtree);

# remove top node attributes
if ($options) {
    my $top=$subtree;
    if ($options eq "relcat") {
	$top->del_att(rel);
	$top->set_att(cat=>" ");

    }

    elsif ($options eq "rel") {
	$top->del_att(rel);
    }
    elsif ($options eq "cat") {
	$top->del_att(cat);
    }
    else {
	 $top->del_att($options);
    }
}

$subtree->print;


### subroutines ###

sub cut_unary {
	my ($twig)=@_;
	my @children=$twig->children;
	if (@children==1) {
		&cut_unary($children[0]);
	}
	else {
		return $twig;
	}
}

sub process_twig {
	my ($twig,$refpos,$mode,$split) = @_;
	my @children=$twig->children();
	my %int;
	foreach my $child(@children){
		# print
		my $result = process_twig($child,$refpos,$mode,$split);
		unless ($result) {
			$child->cut;
		}
		else {
			$twig->{att}->{interesting}='cat';
		}
	}

	if ((defined($twig->{att}->{interesting})) &&
		($twig->{'att'}->{'interesting'} ne 'na')) {
			my $interesting=$twig->{'att'}->{'interesting'}; # value of @interesting attribute
			my $hash=$twig->{att};

### define for each mode which attributes should be included ###

			if ($mode eq 'lassy') {
			    $int{rel}++; # always include rel
			    $int{pos}++; # always include pos
			    $int{begin}++; # always include begin

			    if ($interesting eq 'cat') {
				$int{cat}++;
			    }
			    if ($interesting eq 'postag') {
				$int{postag}++;
			    }
			    if ($interesting eq 'lemma') {
				$int{root}++;
			    }
			    if ($interesting eq 'token') {
				$int{root}++;
				$int{word}++;
        $int{casesensitive}++;
			    }
			}

			elsif ($mode eq 'cgn') {
			    $int{rel}++; # always include rel
			    $int{pt}++; # always include pt
			    $int{begin}++; # always include begin

			    if ($interesting eq 'cat') {
				$int{cat}++;
			    }
			    if ($interesting eq 'postag') {
				$int{postag}++;
			    }
			    if ($interesting eq 'lemma') {
				$int{lemma}++;
			    }
			    if ($interesting eq 'token') {
				$int{lemma}++;
				$int{word}++;
        $int{casesensitive}++;
			    }
			}

			elsif ($mode eq 'sonar') {
			    $int{rel}++; # always include rel
			    $int{pt}++; # always include pt
			    $int{begin}++; # always include begin

			    if ($interesting eq 'cat') {
				$int{cat}++;
			    }
			    if ($interesting eq 'postag') {
				$int{postag}++;
			    }
			    if ($interesting eq 'lemma') {
				$int{lemma}++;
			    }
			    if ($interesting eq 'token') {
				$int{lemma}++;
				$int{word}++;
        $int{casesensitive}++;
			    }
			    if ($interesting eq 'not') {
				$twig->set_att("not")=>"relpt";
				$int{not}++;

			    }
			}

			else { # mode = alpino or undef (default)
			    $int{rel}++; # always include rel
			    $int{pos}++; # always include pos
			    $int{begin}++; # always include begin

			    if ($interesting eq 'cat') {
				$int{cat}++;
			    }
			    if ($interesting eq 'lemma') {
				$int{root}++;
			    }
			    if ($interesting eq 'token') {
				$int{root}++;
				$int{word}++;
        $int{casesensitive}++;
			    }
			}

			foreach (keys %$hash) {
					unless ($int{$_}) {
						$twig->del_att($_);
					}
			}

			if ($split==1) { # split up postags
			    if ($twig->{'att'}->{'postag'}) {
				my $cgntag=$twig->{'att'}->{'postag'}; # get CGN postag
				my @split=&split_one_tag($cgntag,$refpos); # split tag into separate attribute-value pairs

				if (@split) {
				    foreach $s(@split) {
					my ($att,$val) = split(/\|/,$s);
					$twig->set_att($att=>"$val");  # add new elements
				    }
				}
			    }
			}


			return $twig;
	}

	else {
		return undef;
	}
}


sub split_one_tag {
    # split tag
    my ($tag,$refpos)=@_; # refpos = reference naar hash
    if ($tag=~/(\w+)\((.*?)\)/) {
	$pt=$1; # get pt
	$pts=$2;# get other parts
    }
    # assign attribute to parts
    my @pts= split(/,/,$pts);   # split parts
    my @parts;
    foreach $val(@pts) {

	if ($pt ne "BW" || $pt ne "TSW"|| $pt ne "LET") {
	    $feature=$refpos{$pt};
	    $att=$$feature{$val};   # same as $att=$feature->{$val};
	}

	else {
	    # do nothing if $pt equals BW, TSW or LET
	    return undef;
	}

	$attval=$att."|".$val; # combine attribute-value
	push(@parts, $attval);
    }

    return @parts; # return array of attribute-value pairs
}


sub initialize {
    # hashes with value-attribute pairs

    my %n = ('soort'=> 'ntype',
	     'eigen'=> 'ntype',
	     'ev'=> 'getal',
	     'mv'=> 'getal',
	     'basis' => 'graad',
	     'dim' => 'graad',
	     'onz' => 'genus',
	     'zijd' => 'genus',
	     'stan'=>'naamval',
	     'gen'=>'naamval',
	     'dat'=>'naamval'
	);

    my %adj = ('prenom'=> 'positie',
	       'nom'=> 'positie',
	       'post'=> 'positie',
	       'vrij'=> 'positie',
	       'basis' => 'graad',
	       'comp' => 'graad',
	       'sup' => 'graad',
	       'dim' => 'graad',
	       'zonder'=> 'buiging',
	       'met-e'=> 'buiging',
	       'met-s'=> 'buiging',
	       'zonder-n'=> 'getal-n',
	       'mv-n'=> 'getal-n',
	       'stan'=> 'naamval',
	       'bijz'=>'naamval'
	);

    my %ww = ('pv'=> 'wvorm',
	      'inf'=> 'wvorm',
	      'od'=> 'wvorm',
	      'vd'=> 'wvorm',
	      'tgw'=> 'pvtijd',
	      'verl'=> 'pvtijd',
	      'conj'=> 'pvtijd',
	      'ev'=> 'pvagr',
	      'mv'=> 'pvagr',
	      'met-t'=> 'pvagr',
	      'prenom'=> 'positie',
	      'nom'=> 'positie',
	      'vrij'=> 'positie',
	      'zonder'=> 'buiging',
	      'met-e'=> 'buiging',
	      'zonder-n'=> 'getal-n',
	      'mv-n'=> 'getal-n'
	);

     my %tw = ('hoofd'=> 'numtype',
	       'rang'=> 'numtype',
	       'prenom'=> 'positie',
	       'nom'=> 'positie',
	       'vrij'=> 'positie',
	       'zonder-n'=> 'getal-n',
	       'mv-n'=> 'getal-n',
	       'basis' => 'graad',
	       'dim' => 'graad',
	       'stan'=> 'naamval',
	       'bijz'=>'naamval'
	 );


     my %vnw = ('pers'=> 'vwtype',
		'refl'=> 'vwtype',
		'pr'=> 'vwtype',
		'recip'=> 'vwtype',
		'pos'=> 'vwtype',
		'vrag'=> 'vwtype',
		'betr'=> 'vwtype',
		'bez'=> 'vwtype',
		'vb'=> 'vwtype',
		'excl'=> 'vwtype',
		'aanw'=> 'vwtype',
		'onbep'=> 'vwtype',
		'pron'=> 'pdtype',
		'adv-pron'=> 'pdtype',
		'det'=> 'pdtype',
		'grad'=> 'pdtype',
		'stan'=>'naamval',
		'nomin'=>'naamval',
		'obl'=>'naamval',
		'gen'=>'naamval',
		'dat'=>'naamval',
		'vol'=>'status',
		'red'=>'status',
		'nadr'=>'status',
		'1'=>'persoon',
		'2'=>'persoon',
		'2v'=>'persoon',
		'2b'=>'persoon',
		'3'=>'persoon',
		'3p'=>'persoon',
		'3m'=>'persoon',
		'3v'=>'persoon',
		'3o'=>'persoon',
		'ev'=>'getal',
		'mv'=>'getal',
		'getal'=>'getal',
		'masc' => 'genus',
		'fem' => 'genus',
		'onz' => 'genus',
		'prenom'=> 'positie',
		'nom'=> 'positie',
		'post'=> 'positie',
		'vrij'=> 'positie',
		'zonder'=> 'buiging',
		'met-e'=> 'buiging',
		'met-s'=> 'buiging',
		'agr'=> 'npagr',
		'evon'=> 'npagr',
		'rest'=> 'npagr',
		'evz'=> 'npagr',
		'agr3'=> 'npagr',
		'evmo'=> 'npagr',
		'rest3'=> 'npagr',
		'evf'=> 'npagr',
		#'mv'=> 'npagr',
		'zonder-n'=> 'getal-n',
		'mv-n'=> 'getal-n',
		'basis' => 'graad',
		'comp' => 'graad',
		'sup' => 'graad',
		'dim' => 'graad'
	 );


     my %lid = ('bep'=> 'lwtype',
		'onbep'=> 'lwtype',
		'stan'=>'naamval',
		'gen'=>'naamval',
		'dat'=>'naamval',
		'agr'=> 'npagr',
		'evon'=> 'npagr',
		'evmo'=> 'npagr',
		'rest'=> 'npagr',
		'rest3'=> 'npagr',
		'evf'=> 'npagr',
		'mv'=> 'npagr'
		);

    my %vz = ('init'=> 'vztype',
	      'versm'=> 'vztype',
	      'fin'=> 'vztype'
	);

    my %vg = ('neven'=> 'vgtype',
	      'onder'=> 'vgtype'
	);

    my %spec = ('afgebr'=> 'spectype',
		'onverst'=> 'spectype',
		'vreemd'=> 'spectype',
		'deeleigen'=> 'spectype',
		'meta'=> 'spectype',
		'comment'=> 'spectype',
		'achter'=> 'spectype',
		'afk'=> 'spectype',
		'symb'=> 'spectype'
	);

    # hash of hash references
    $refpos{"N"}={%n};
    $refpos{"ADJ"}={%adj};
    $refpos{"WW"}={%ww};
    $refpos{"TW"}={%tw};
    $refpos{"VNW"}={%vnw};
    $refpos{"LID"}={%lid};
    $refpos{"VZ"}={%vz};
    $refpos{"VG"}={%vg};
    $refpos{"SPEC"}={%spec};

    return {%refpos}; # {} => reference van hash
}
