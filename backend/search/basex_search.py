"""Auxiliary functions to facilitate searching in BaseX."""


def generate_xquery_search(basex_db: str, xpath: str) -> str:
    """Return XQuery string for use in BaseX to get all occurances
    of a given XPath in XML format in a given BaseX database."""
    query = 'for $node in db:open("' + basex_db + '")/treebank' \
            + xpath + \
            'let $tree := ($node/ancestor::alpino_ds)' \
            'let $sentid := ($tree/@id)' \
            'let $sentence := ($tree/sentence)' \
            'let $ids := ($node//@id)' \
            'let $indexs := (distinct-values($node//@index))' \
            'let $indexed := ($tree//node[@index=$indexs])' \
            'let $begins := (($node | $indexed)//@begin)' \
            'let $beginlist := (distinct-values($begins))' \
            'let $meta := ($tree/metadata/meta)' \
            ' return <match>{data($sentid)}||{data($sentence)}' \
            '||{string-join($ids, \'-\')}||' \
            '{string-join($beginlist, \'-\')}||{$node}||{$meta}' \
            '||</match>'
    # TODO: currently no support for grinded coprora and for variables.
    # Add returntb and variable_results from original implementation.
    return query


def generate_xquery_count(basex_db: str, xpath: str) -> str:
    """Return XQuery string for use in BaseX to get the count of all
    occurances of a given XPath in a given BaseX database."""
    return 'count(for $node in db:open("{}")/treebank{} return $node)' \
        .format(basex_db, xpath)
