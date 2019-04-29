#!/usr/bin/perl

# GetSubtree.pl
# Subtree finder which extracts a subtree from an Alpino XML tree

# version 1.8 date: 23.05.2018 made more robust for new versions of Alpino
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

use XML::Twig;

my $refpos = &initialize;

my ( $inputxml, $options ) = @ARGV;

my $twig = XML::Twig->new( 'pretty_print' => 'indented' );
$twig->parse($inputxml);

# start at 'top' node (leave out alpino_ds node, skip 'parser' tag)
# 1.8 added 'node'restriction to make sure the first_child is the syntax tree
my $root=$twig->root->first_child('node'); # start at 'top' node (leave out alpino_ds node)
$tree     = $twig->children;
@children = $tree->children;
$children[1]->cut;
$subtree = &process_twig( $root, $refpos );
$subtree = &cut_unary($subtree);

# Remove top node attributes
if ($options) {
    my $top = $subtree;
    $top->del_att(rel);
    if ( $options eq 'relcat' && $top->{'att'}->{'cat'} ) {
        $top->set_att( 'cat' => ' ' );
    }
}

$subtree->print;

### subroutines ###

sub cut_unary {
    my ($twig) = @_;
    my @children = $twig->children;
    if ( @children == 1 ) {
        &cut_unary( $children[0] );
    }
    else {
        return $twig;
    }
}

sub process_twig {
    my ( $twig, $refpos ) = @_;
    my @children = $twig->children();
    my %int;
    foreach my $child (@children) {
        my $result = process_twig( $child, $refpos );
        unless ($result) {
            $child->cut;
        }
        else {
            $twig->{'att'}->{'interesting'} = 'cat';
        }
    }

    if (   ( defined( $twig->{'att'}->{'interesting'} ) )
        && ( $twig->{'att'}->{'interesting'} ne 'na' ) )
    {
        my $interesting = $twig->{'att'}->{'interesting'};
        my $hash        = $twig->{'att'};

        $int{'rel'}++;
        $int{'begin'}++;
        $int{'pt'}++;

        if ( $interesting eq 'cat' ) {
            $int{'cat'}++;
        }
        elsif ( $interesting eq 'postag' ) {
            $int{'postag'}++;
        }
        elsif ( $interesting eq 'lemma' ) {
            $int{'lemma'}++;
        }
        elsif ( $interesting eq 'token' ) {
            $int{'lemma'}++;
            $int{'word'}++;
            $int{'caseinsensitive'}++;
        }
        elsif ( $interesting eq 'not' ) {
            $int{'not'}++;
            $twig->set_att( 'not' => 'not' );
        }

        foreach ( keys %$hash ) {
            unless ( $int{$_} ) {
                $twig->del_att($_);
            }
        }
        if ( $twig->{'att'}->{'postag'} ) {
            my $cgntag = $twig->{'att'}->{'postag'};    # get CGN postag
                 # split tag into separate attribute-value pairs
            my @split = &split_one_tag( $cgntag, $refpos );

            if (@split) {
                foreach $s (@split) {
                    my ( $att, $val ) = split( /\|/, $s );
                    $twig->set_att( $att => $val );    # add new elements
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
    my ( $tag, $refpos ) = @_;    # refpos = reference naar hash
    if ( $tag =~ /(\w+)\((.*?)\)/ ) {
        $pt  = $1;                # get pt
        $pts = $2;                # get other parts
    }

    # assign attribute to parts
    my @pts = split( /,/, $pts );    # split parts
    my @parts;
    foreach $val (@pts) {

        if ( $pt ne 'BW' || $pt ne 'TSW' || $pt ne 'LET' ) {
            $feature = $refpos{$pt};
            $att     = $$feature{$val};    # same as $att=$feature->{$val};
        }

        else {
            # do nothing if $pt equals BW, TSW or LET
            return undef;
        }

        $attval = $att . '|' . $val;       # combine attribute-value
        push( @parts, $attval );
    }

    return @parts;    # return array of attribute-value pairs
}

sub initialize {

    # hashes with value-attribute pairs

    my %n = (
        'soort' => 'ntype',
        'eigen' => 'ntype',
        'ev'    => 'getal',
        'mv'    => 'getal',
        'basis' => 'graad',
        'dim'   => 'graad',
        'onz'   => 'genus',
        'zijd'  => 'genus',
        'stan'  => 'naamval',
        'gen'   => 'naamval',
        'dat'   => 'naamval'
    );

    my %adj = (
        'prenom'   => 'positie',
        'nom'      => 'positie',
        'post'     => 'positie',
        'vrij'     => 'positie',
        'basis'    => 'graad',
        'comp'     => 'graad',
        'sup'      => 'graad',
        'dim'      => 'graad',
        'zonder'   => 'buiging',
        'met-e'    => 'buiging',
        'met-s'    => 'buiging',
        'zonder-n' => 'getal-n',
        'mv-n'     => 'getal-n',
        'stan'     => 'naamval',
        'bijz'     => 'naamval'
    );

    my %ww = (
        'pv'       => 'wvorm',
        'inf'      => 'wvorm',
        'od'       => 'wvorm',
        'vd'       => 'wvorm',
        'tgw'      => 'pvtijd',
        'verl'     => 'pvtijd',
        'conj'     => 'pvtijd',
        'ev'       => 'pvagr',
        'mv'       => 'pvagr',
        'met-t'    => 'pvagr',
        'prenom'   => 'positie',
        'nom'      => 'positie',
        'vrij'     => 'positie',
        'zonder'   => 'buiging',
        'met-e'    => 'buiging',
        'zonder-n' => 'getal-n',
        'mv-n'     => 'getal-n'
    );

    my %tw = (
        'hoofd'    => 'numtype',
        'rang'     => 'numtype',
        'prenom'   => 'positie',
        'nom'      => 'positie',
        'vrij'     => 'positie',
        'zonder-n' => 'getal-n',
        'mv-n'     => 'getal-n',
        'basis'    => 'graad',
        'dim'      => 'graad',
        'stan'     => 'naamval',
        'bijz'     => 'naamval'
    );

    my %vnw = (
        'pers'     => 'vwtype',
        'refl'     => 'vwtype',
        'pr'       => 'vwtype',
        'recip'    => 'vwtype',
        'pos'      => 'vwtype',
        'vrag'     => 'vwtype',
        'betr'     => 'vwtype',
        'bez'      => 'vwtype',
        'vb'       => 'vwtype',
        'excl'     => 'vwtype',
        'aanw'     => 'vwtype',
        'onbep'    => 'vwtype',
        'pron'     => 'pdtype',
        'adv-pron' => 'pdtype',
        'det'      => 'pdtype',
        'grad'     => 'pdtype',
        'stan'     => 'naamval',
        'nomin'    => 'naamval',
        'obl'      => 'naamval',
        'gen'      => 'naamval',
        'dat'      => 'naamval',
        'vol'      => 'status',
        'red'      => 'status',
        'nadr'     => 'status',
        '1'        => 'persoon',
        '2'        => 'persoon',
        '2v'       => 'persoon',
        '2b'       => 'persoon',
        '3'        => 'persoon',
        '3p'       => 'persoon',
        '3m'       => 'persoon',
        '3v'       => 'persoon',
        '3o'       => 'persoon',
        'ev'       => 'getal',
        'mv'       => 'getal',
        'getal'    => 'getal',
        'masc'     => 'genus',
        'fem'      => 'genus',
        'onz'      => 'genus',
        'prenom'   => 'positie',
        'nom'      => 'positie',
        'post'     => 'positie',
        'vrij'     => 'positie',
        'zonder'   => 'buiging',
        'met-e'    => 'buiging',
        'met-s'    => 'buiging',
        'agr'      => 'npagr',
        'evon'     => 'npagr',
        'rest'     => 'npagr',
        'evz'      => 'npagr',
        'agr3'     => 'npagr',
        'evmo'     => 'npagr',
        'rest3'    => 'npagr',
        'evf'      => 'npagr',

        #'mv'=> 'npagr',
        'zonder-n' => 'getal-n',
        'mv-n'     => 'getal-n',
        'basis'    => 'graad',
        'comp'     => 'graad',
        'sup'      => 'graad',
        'dim'      => 'graad'
    );

    my %lid = (
        'bep'   => 'lwtype',
        'onbep' => 'lwtype',
        'stan'  => 'naamval',
        'gen'   => 'naamval',
        'dat'   => 'naamval',
        'agr'   => 'npagr',
        'evon'  => 'npagr',
        'evmo'  => 'npagr',
        'rest'  => 'npagr',
        'rest3' => 'npagr',
        'evf'   => 'npagr',
        'mv'    => 'npagr'
    );

    my %vz = (
        'init'  => 'vztype',
        'versm' => 'vztype',
        'fin'   => 'vztype'
    );

    my %vg = (
        'neven' => 'vgtype',
        'onder' => 'vgtype'
    );

    my %spec = (
        'afgebr'    => 'spectype',
        'onverst'   => 'spectype',
        'vreemd'    => 'spectype',
        'deeleigen' => 'spectype',
        'meta'      => 'spectype',
        'comment'   => 'spectype',
        'achter'    => 'spectype',
        'afk'       => 'spectype',
        'symb'      => 'spectype'
    );

    # hash of hash references
    $refpos{'N'}    = {%n};
    $refpos{'ADJ'}  = {%adj};
    $refpos{'WW'}   = {%ww};
    $refpos{'TW'}   = {%tw};
    $refpos{'VNW'}  = {%vnw};
    $refpos{'LID'}  = {%lid};
    $refpos{'VZ'}   = {%vz};
    $refpos{'VG'}   = {%vg};
    $refpos{'SPEC'} = {%spec};

    return {%refpos};    # {} => hash reference
}
