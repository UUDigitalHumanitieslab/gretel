#!/usr/bin/perl

# xml2tree.pl
# script adds an XSL stylesheet to an Alpino-XML parse

# version 1.5 date: 14.10.2014  RELEASED WITH GrETEL2.0
# written by Liesbeth Augustinus (c) 2014
# for the GrETEL2.0 project

# arg 1: xml-tree
# arg 2: xpath
# arg 3: style

use strict;
use XML::Twig::XPath;

# create the twig
my $twig = XML::Twig::XPath->new( pretty_print => 'indented' );

my $inputxml = $ARGV[0];
my $inputxp  = $ARGV[1];
my $style    = $ARGV[2];

# style for sonar
if ( $style eq "psonar" ) {
    # plain
    $style = "../style/xsl/xml2tree-sonar.xsl";
}
elsif ( $style eq "zsonar" ) {
    #zoom
    $style = "../style/xsl/xml2tree-sonar-zoom.xsl";
}
elsif ( $style eq "ptsonar" ) {
    # extended postags
    $style = "../style/xsl/xml2tree-sonar-postag.xsl";
}
elsif ( $style eq "tv-default" ) {
    # do nothing
}
else {
    # default (plain Alpino style)
    $style = "../style/xsl/xml2tree-alpino-plain.xsl";
}

if ( $inputxml =~ /^<alpino_ds/ ) {
    # build it (xml-string)
    $twig->parse("$inputxml");
}
else {
    # build it (xml-file)
    $twig->parsefile("$inputxml");
}

unless ( $style eq "tv-default" ) { $twig->add_stylesheet( xsl => $style ); }
my $root     = $twig->root;
my $sentence = $root->first_child('sentence');
my @xpath    = $twig->find_nodes($inputxp);

if (@xpath) {
    foreach my $node (@xpath) {
        $node->set_att( highlight => "yes" );
    }
}

else {
    open( ERROR, ">../log/xml2tree.log" );
    print ERROR "Can't find $inputxp\n";
    close(ERROR);
    my $backupxp = '//node[@rel="top"]';
    @xpath = $twig->find_nodes($backupxp);
    foreach my $node (@xpath) {
        $node->set_att( highlight => "yes" );
    }
}
$twig->print();
