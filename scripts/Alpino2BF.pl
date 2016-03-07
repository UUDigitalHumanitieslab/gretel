#!/usr/bin/perl

# Alpino2BF.pl
# converts query tree in Alpino format into breadth-first pattern
# in order to retrieve appropriate BaseX database

# version 0.4 date: 15.10.2014  RELEASED WITH GrETEL2.0
# written by Vincent Vandeghinste (c) 2014
# for the GrETEL2.0 project

#########################################################################

$version='0.4'; # ignore top cat

use XML::Twig;

my $xml=shift(@ARGV); # first input argument: xml-file
my $twig=XML::Twig->new(pretty_print => "nice");
$twig->parsefile($xml);

my ($cat,$fullfilename)=&GetTopBFFilename($twig->root->first_child);

if ($cat eq ' ') { # top cat is underspecified
    print "ALL".$fullfilename."\n";
}
else {
    print $cat.$fullfilename."\n";
}

sub GetTopBFFilename {
    my ($twig)=@_;
    my @children=$twig->children;
    my (@bfchildren,$cat);
    foreach (@children) {
	unless ($cat=$_->att('cat')) {
	    $cat=$_->att('pt');
	}
	my $rel=$_->att('rel');
	push(@bfchildren,join('%',($rel,$cat)));
    }
    my @sorted=sort {$a cmp $b} @bfchildren;
    unless ($cat=$twig->att('cat')) {
	$cat=$_->att('pt');
    }
    return ($cat,join("_",@sorted));
} 



