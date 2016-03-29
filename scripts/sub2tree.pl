#!/usr/bin/perl

# sub2tree.pl
# script adds a root node to an Alpino-XML parse and adds an XSL stylesheet to it

# version 1.4 date: 14.10.2014  RELEASED WITH GrETEL2.0
# written by Liesbeth Augustinus (c) 2014
# for the GrETEL2.0 project

# arg 1: xml-tree
# arg 2: xpath
# arg 3: style

use strict;
use XML::Twig;
local $/;

my $inputxml=$ARGV[0];
my $inputxp=$ARGV[1];
my $style=$ARGV[2];

my $new=XML::Twig->new(pretty_print => 'indented');

# style for sonar
if ($style eq "psonar") {
    $style="../style/xsl/xml2tree-sonar.xsl"; # plain
}
elsif ($style eq "zsonar") {
    $style="../style/xsl/xml2tree-sonar-zoom.xsl"; #zoom
}
elsif ($style eq "ptsonar") {
    $style="../style/xsl/xml2tree-sonar-postag.xsl"; # extended postags
}
elsif ($style eq "default") {
    $style="../style/xsl/xml2tree-alpino-plain-bhl.xsl"; # default (plain)
}
else {
    $style="../style/xsl/xml2tree-alpino-plain-bhl.xsl"; # default (plain)
}

open(SUB, "$inputxml");
my $subtree = <SUB>;
$new->parse( "<alpino_ds>$subtree</alpino_ds>");
$new->add_stylesheet(xsl=>$style);
my $root=$new->root;
my $top=$root->first_child;
$top->del_att('rel'); # remove dependency relation of top node
my @xpath = $new->find_nodes($inputxp);

if (@xpath) {
    foreach my $node(@xpath) {
    $node->set_att(highlight=>"yes");
    }
}

else {
    open (ERROR, ">../log/errortwig.log");
    print ERROR "Can't find $inputxp\n";
    close (ERROR);
    my $backupxp='//node[@rel="top"]';
    @xpath = $new->find_nodes($backupxp);
    foreach my $node(@xpath) {
	$node->set_att(highlight=>"yes");
    }
}
close(SUB);
$new->print();
