#!/usr/bin/perl
# XPathGenerator.pl
# Alpino-XML XPath Generator

# version 1.7 date: 10.06.2015  bug fix (@number)
# version 1.6 date: 15.12.2014  bug fix (ignore not-function if word order is checked)
# version 1.5 date: 14.10.2014  RELEASED WITH GrETEL2.0
# written by Vincent Vandeghinste and Liesbeth Augustinus (c) 2014
# for the GrETEL2.0 project

# script converts an XML tree into an XPath expression

############################################################################
# argument: -xml: path to xml-subtree
# options: -order/-o: word order is important
#          -r: exclude root node from the XPath expression
#          -version/-v: script details
#          -in: attributes to include (comma-separated list)
#          -ex: attributes to exclude (comma-separated list)

############################################################################

use Getopt::Long;
use XML::Twig;

my $prog = "Alpino-XML XPath Generator";
my $date = "September, 13, 2013";    
my $author = "Vincent Vandeghinste & Liesbeth Augustinus";
my $versionnr = "1.5";

# get command line options

GetOptions("order", "o",
	   "root", "r",
           "help", "h",
           "version", "v",
	   "xml=s",
	   "in=s",
	   "ex=s"
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
    print "--order | -o:\ttakes word order into account\n";
    print "--root | -r:\t excludes root node from the XPath expression\n";
    print "-in:\t attributes to be included in the XPath expression\n";
    print "-ex:\tattributes to be excluded from the XPath expression\n";
    print "\n";
    print "The script takes one argument, i.e. a path to an XML file\n";
    print "\n";
    exit(0);
}

if (($opt_r) || ($opt_root)) {
    $rt=1;
}

if (($opt_o) || ($opt_order)) {
    $order=1;
}

if ($opt_in) {
    $attsin=$opt_in;
}
if ($opt_ex) {
    $attsout=$opt_ex;
    $attsout=~s/\,/\|/g;
    $attsout=~s/(\w+)/\($1\)/g;
}

if (!($opt_xml)) {
    print "You need to specify an XML file with -xml.\n";
    exit(-1);
}

# get XML
$inputxml=$opt_xml;

my $twig=XML::Twig->new(pretty_print => 'indented');    # create the twig

$twig->parsefile("$inputxml");

my $root=$twig->root;
my $subtree;

if ($rt) {   
    @children=$root->children;
    if (scalar(@children)>1) {
	die "There is more than one child under the root node, so the -root option does not work.\n";
    }
    else {
    $subtree=$root->first_child; # leave out root node (only works if one child under top node)
    }
}

else {
    if ($root->get_xpath('/alpino_ds')) { # for ALPINO XML, leave out the alpino_ds node
	$subtree=$root->first_child;
    }
    else {
	$subtree=$root; # start at root node
    }
}

# generate XPath expression

my $topxpath=GetXPath($subtree,$attsin,$attsout);
$xpath=ProcessTree($subtree,$order,$attsin,$attsout);


if ($xpath && $topxpath) { # if more than one node is selected
    $xpath='//'.$topxpath. ' and '.$xpath.']';
}

elsif ($xpath && !$topxpath) {
    $xpath='//*['.$xpath.']';
}

elsif (!$xpath && $topxpath) {
     $xpath='//'.$topxpath.']'; # if only one node is selected
}

else {
    print "ERROR: no XPath expression could be generated.\n";
}


if ($xpath=~/not/) { # exclude nodes using not-function
    $xpath =~ s/\sand\s\@not=".*?"//g;
}
print "$xpath\n";

  
sub ProcessTree {
    my ($tree,$order,$attsin,$attsout)=@_;
    my ($xpath,$nextpath,$childxpath);
    my @children=$tree->children;
    my (@childxpaths,%COUNTS,%ALREADY);
    if (@children>0) {
	foreach (@children) {
	    $childxpath=GetXPath($_,$attsin,$attsout);
	    
	    if ($childxpath) {
		$lower=&ProcessTree($_,$order,$attsin,$attsout);
		if ($lower) {
		    $childxpath.=' and '.$lower.']';
		}
		else {
		    $childxpath.=']';

		    if ($childxpath=~/not/) { # exclude nodes using not-function
			$childxpath='not('.$childxpath.')';
			$childxpath =~ s/\sand\s\@not=".*?"//;
		    }
		    
		}
		$COUNTS{$childxpath}++;
		push(@childxpaths,$childxpath);
		
	    }
	}
	if (@childxpaths) {
	    for ($i=0;$i<@childxpaths;$i++) {

		## ADD COUNT FUNCTION
		if ($COUNTS{$childxpaths[$i]}>1) {
		    $childxpaths[$i]='count('.$childxpaths[$i].') > '.($COUNTS{$childxpaths[$i]}-1);
		    $dummy;
		}
		## REMOVE DOUBLE DAUGHTERS
		if ($ALREADY{$childxpaths[$i]}) {
		    splice(@childxpaths,$i,1);
		    $i--;
		}
		else {
		    $ALREADY{$childxpaths[$i]}=1;
		}

	    }		
	    $xpath=join(' and ',@childxpaths);
	}
	else {
	    #die "not implemented yet\n";
	    return undef;
	}
    }
    else { # no children
	if ($order) {
	    $xpath='number(@begin)';
	    ($next_term,$nextpath)=&FindNextTerminalToCompare($tree);
	    if ($next_term) {
		if ($tree->{att}->{begin} < $next_term->{att}->{begin}) {
		    $xpath.=" < ";
		}
		else {
		    $xpath.=" > ";
		}
		$xpath.=$nextpath;
	    }
	    else {
		return undef;
	    }
	}
	else {
	}
    }
    return $xpath;
}

sub FindNextTerminalToCompare {
    my ($tree)=@_;
    my ($path,$xpath,$next_terminal);
    if ($next_sibling=$tree->next_sibling) {
	$path="../";
	($next_terminal,$xpath)=&FindNextLeafNode($next_sibling);
	$path=$path.$xpath;
	if ($path=~/begin/) {
	    # $path='number('.$path.')';
	     $path=~s/\@begin/number\(\@begin\)/;
	}
    }
    else {
	# go up the tree to find next sibling
	my $parent=$tree->parent;
	if ($parent) {
	    ($next_terminal,$nextpath)=&FindNextTerminalToCompare($parent);
	    unless ($nextpath) {
		return undef;
	    }
	    $path="../".$nextpath;
	}
	else {
	    return undef;
	}
    }
    return ($next_terminal,$path);
}

sub FindNextLeafNode {
    my ($node)=@_;
    my @children=$node->children;
    my $childpath;
    my $xpath=GetXPath($node,$attsin,$attsout).']';
    
#   if ($xpath=~/not/) { # exclude nodes using not-function
#			$xpath='not('.$xpath.')';
#			$xpath =~ s/\sand\s\@not=".*?"//;
#		    }

    if (@children>0) {
	($node,$childpath)=FindNextLeafNode($children[0]);
	$xpath.="/".$childpath;
	return ($node,$xpath);
    }
    else {
	my $path=$xpath.'/@begin';
	return ($node,$path);
    }
}

sub GetXPath {
    my ($tree,$attsin,$attsout)=@_;
    my $att=$tree->{att};
    my @atts;

    if (!$attsin && !$attsout) {
	foreach (keys %$att) {  # all attributes are included in the XPath expression
		push(@atts,"@".$_."=\"".$$att{$_}."\"");
	}
    }
    
    elsif ($attsin && !$attsout) {
	@attsin=split(",",$attsin);
	foreach (@attsin) {  # the attributes defined in the array are included in the XPath expression
		if (defined($att->{$_})) {
		    push(@atts,"@".$_."=\"".$$att{$_}."\"");
	    }
	}	
    }
    
    elsif (!$attsin && $attsout) {
	foreach (keys %$att) {   # all attributes are included in the XPath expression...
	    unless (/$attsout/) {    # ...except these ones
		push(@atts,"@".$_."=\"".$$att{$_}."\"");
	    }
	}
    }

    else { 
	@attsin=split(",",$attsin);
	foreach (@attsin) {
	    unless (/$attsout/) {
		if (defined($att->{$_})) {
		    push(@atts,"@".$_."=\"".$$att{$_}."\""); # regular attributes
		}
	    }
	}
    }
    
    my $xstring;
    
    if (scalar(@atts)==0) { # no matching attributes found
	return undef;
    }

    else { # one or more attributes found 
	my $string=join(" and ",@atts);
	$xstring="node[".$string;

	return $xstring;
    }
    
}

