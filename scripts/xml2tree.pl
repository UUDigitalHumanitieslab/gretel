#!/usr/bin/perl

# xml2tree.pl
# script adds an XSL stylesheet to an Alpino-XML parse

# version 1.5 date: 14.10.2014  RELEASED WITH GrETEL2.0
# written by Liesbeth Augustinus (c) 2014
# for the GrETEL2.0 project

# arg 1: xml-tree
# arg 2: xpath

use strict;
use XML::Twig::XPath;

# create the twig
my $twig = XML::Twig::XPath->new( pretty_print => 'indented' );

my $inputxml = $ARGV[0];
my $inputxp  = $ARGV[1];

if ( $inputxml =~ /^<alpino_ds/ ) {
    # build it (xml-string)
    $twig->parse("$inputxml");
}
else {
    # build it (xml-file)
    $twig->parsefile("$inputxml");
}

my $root     = $twig->root;
my $sentence = $root->first_child('sentence');
my @xpath    = $twig->find_nodes("$inputxp");

if (@xpath) {
    foreach my $node (@xpath) {
        $node->set_att(highlight => "yes");
    }
}

else {
    open( ERROR, ">../log/xml2tree.log" );
    print ERROR "Can't find $inputxp\n";
    close(ERROR);
    my $backupxp = '//node[@rel="top"]';
    @xpath = $twig->find_nodes("$backupxp");
    foreach my $node (@xpath) {
        $node->set_att(highlight => "yes");
    }
}
$twig->print();
