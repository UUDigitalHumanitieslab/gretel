"""Auxiliary functions to facilitate searching in BaseX."""

import lxml.etree

ALLOWED_DBNAME_CHARS = '!#$%&\'()+-=@[]^_`{}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcde' \
                       'fghijklmnopqrstuvwxyz0123456789'


def check_xpath(xpath: str) -> bool:
    """Return True if a string is (only) a valid XPath, otherwise False."""
    try:
        lxml.etree.XPath(xpath)
    except lxml.etree.XPathError:
        return False
    else:
        return True


def check_db_name(db_name: str) -> bool:
    """Return True if a string may be (only) a valid BaseX database name,
    otherwise False."""
    return all(x in ALLOWED_DBNAME_CHARS for x in db_name)


def generate_xquery_search(basex_db: str, xpath: str) -> str:
    """Return XQuery string for use in BaseX to get all occurances
    of a given XPath in XML format in a given BaseX database."""
    if not check_db_name(basex_db) or not check_xpath(xpath):
        raise ValueError('Incorrect database or malformed XPath given')
    query = 'for $node in db:open("' + basex_db + '")/treebank' \
            + xpath + \
            ' let $tree := ($node/ancestor::alpino_ds)' \
            ' let $sentid := ($tree/@id)' \
            ' let $sentence := ($tree/sentence)' \
            ' let $ids := ($node//@id)' \
            ' let $indexs := (distinct-values($node//@index))' \
            ' let $indexed := ($tree//node[@index=$indexs])' \
            ' let $begins := (($node | $indexed)//@begin)' \
            ' let $beginlist := (distinct-values($begins))' \
            ' let $meta := ($tree/metadata/meta)' \
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
    if not check_db_name(basex_db) or not check_xpath(xpath):
        raise ValueError('Incorrect database or malformed XPath given')
    return 'count(for $node in db:open("{}")/treebank{} return $node)' \
        .format(basex_db, xpath)


def get_number_of_matches(results: str) -> int:
    return results.count('<match>')
