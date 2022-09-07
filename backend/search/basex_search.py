"""Auxiliary functions to facilitate searching in BaseX."""

import lxml.etree
import string
from io import StringIO

ALLOWED_DBNAME_CHARS = string.ascii_letters + string.digits + \
    '!#$%&\'()+-=@[]^_`{}~.'
ALLOWED_VARNAME_CHARS = string.ascii_letters + string.digits + '-_.'


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


def check_xquery_variable_name(variable: str) -> bool:
    if len(variable) < 1 or variable[0] != '$':
        return False
    return all(x in ALLOWED_VARNAME_CHARS for x in variable[1:])


def generate_xquery_for_variables(variables=None):
    '''Return the let and return fragments as a tuple for the variables
    part of a search XQuery, to be used for the analysis phase'''
    let_fragment = ''
    return_fragment_inside = ''
    if variables is None:
        variables = []
    for variable in variables:
        name = variable['name']
        path = variable['path']
        if not check_xquery_variable_name(name):
            raise ValueError('Invalid XQuery variable: {}'.format(name))
        if not check_xpath(path):
            raise ValueError('Invalid XPath: {}'.format(path))
        properties = variable.get('props', {})
        # Create fragment for let clause in XQuery for variables
        if name != '$node':
            # The root node is already declared in the query itself,
            # do not declare it again
            let_fragment += ' let {} := ({})[1]'.format(
                name, path
            )
        # Create fragment for return clause in XQuery for variables
        properties_xml = ''
        for prop_name in properties:
            prop_expression = properties[prop_name]
            if not all(x in ALLOWED_VARNAME_CHARS for x in prop_name):
                raise ValueError(
                    'Property name should be valid XML name: {}'
                    .format(prop_name)
                )
            if '"' in prop_expression or '}' in prop_expression:
                raise ValueError(
                    'Property expression cannot contain double quotation '
                    'mark or closing accolade: {}'.format(prop_expression)
                )
            properties_xml += ' ' + prop_name + '="{' + prop_expression + '}"'
        return_fragment_inside += '<var name="' + name + '"' + \
            properties_xml + '>{' + name + '/@*}</var>'
    if return_fragment_inside:
        return_fragment = '<vars>' + return_fragment_inside + '</vars>'
    else:
        return_fragment = ''
    return let_fragment, return_fragment


def generate_xquery_search(basex_db: str, xpath: str, variables=None) -> str:
    """Return XQuery string for use in BaseX to get all occurances
    of a given XPath in XML format in a given BaseX database."""
    if not check_db_name(basex_db) or not check_xpath(xpath):
        raise ValueError('Incorrect database or malformed XPath given')
    variables_let_fragment, variables_return_fragment = \
        generate_xquery_for_variables(variables)
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
            ' let $meta := ($tree/metadata/meta)' + \
            variables_let_fragment + \
            ' return <match>{data($sentid)}||{data($sentence)}' \
            '||{string-join($ids, \'-\')}||' \
            '{string-join($beginlist, \'-\')}||{$node}||{$meta}' \
            '||' + variables_return_fragment + '||' + \
            basex_db + '</match>'
    # TODO: currently no support for grinded coprora.
    # Add returntb from original implementation.
    # TODO: also no support for context yet
    return query


def generate_xquery_count(basex_db: str, xpath: str) -> str:
    """Return XQuery string for use in BaseX to get the count of all
    occurances of a given XPath in a given BaseX database."""
    if not check_db_name(basex_db) or not check_xpath(xpath):
        raise ValueError('Incorrect database or malformed XPath given')
    return 'count(for $node in db:open("{}")/treebank{} return $node)' \
        .format(basex_db, xpath)


def generate_xquery_metadata_count(basex_db: str, xpath: str) -> str:
    if not check_db_name(basex_db) or not check_xpath(xpath):
        raise ValueError('Incorrect database or malformed XPath given')
    query = f"""<metadata>{{
                for $n
                in (
                    for $node
                    in db:open("{basex_db}"){xpath}
                    return $node/ancestor::alpino_ds/metadata/meta)
                let $k := $n/@name
                let $t := $n/@type
                group by $k, $t
                order by $k, $t

                return element meta {{
                    attribute name {{$k}},
                    attribute type {{$t}},
                    for $m in $n
                    let $v := $m/@value
                    group by $v
                    return element count {{
                        attribute value {{$v}}, count($m)
                    }}
                }}
            }}</metadata>"""
    return query


def generate_xquery_showtree(basex_db: str, sentence_id: str) -> str:
    if not check_db_name(basex_db) or '"' in sentence_id:
        raise ValueError('Incorrect database or malformed sentence ID given')
    return 'db:open("' + basex_db + '")/treebank/alpino_ds[@id="' + \
        sentence_id + '"]'


def parse_search_result(result_str: str, component) -> list:
    """Parse the results returned by BaseX according to the searching
    XQuery generated by generate_xquery_search.

    Arguments:
      result_str (str): BaseX query result
      component (str): slug of current component

    Returns:
      list: A list of matches represented by dictionaries

    Raises:
      ValueError: If result string cannot be parsed
    """
    matches = []
    i = 1
    for result in result_str.split('<match>'):
        result = result.strip()
        if result == '':
            continue
        if result.endswith('</match>'):
            result = result[:-len('</match>')]
        else:
            raise ValueError('Cannot parse XQuery result: <match> '
                             'is not closed in {}'.format(result))
        splitted = result.split('||')
        try:
            (sentid, sentence, ids, begins, xml_sentences, meta, variables,
             database) = splitted
        except ValueError as err:
            raise ValueError('Cannot parse XQuery result: {}'.format(err))
        # Make sentid-s unique by appending a match index (there may be
        # multiple matches per sentence)
        # TODO: can we change this to something more comprehensible?
        sentid = sentid + '+match=' + str(i)
        matches.append({
            'sentid': sentid,
            'sentence': sentence,
            'ids': ids,
            'begins': begins,
            'xml_sentences': xml_sentences,
            'meta': meta,
            'variables': variables,
            'component': component,
            'database': database,
        })
        i += 1
    return matches


def parse_metadata_count_result(result_str: str) -> dict:
    '''Convert the XML generated by BaseX according to the XQuery
    generated by generate_xquery_metadata_count to a dictionary
    listing for every metadata variable the counts for every value.'''
    DTDSTR = '<!ELEMENT metadata (meta*)><!ELEMENT meta (count*)>' \
             '<!ELEMENT count (#PCDATA)><!ATTLIST count value CDATA ' \
             '#REQUIRED><!ATTLIST meta name CDATA #REQUIRED type  '\
             'CDATA #REQUIRED>'
    dtd = lxml.etree.DTD(StringIO(DTDSTR))
    totals = {}
    try:
        root = lxml.etree.fromstring(result_str)
        if not dtd.validate(root):
            raise ValueError('Metadata count XML in invalid format: {}'
                             .format(dtd.error_log))
        for meta_node in root:
            name = meta_node.get('name')
            totals_for_metadata_var = {}
            for count_node in meta_node:
                value = count_node.get('value')
                assert value not in totals_for_metadata_var
                totals_for_metadata_var[value] = int(count_node.text)
            if name not in totals:
                totals[name] = totals_for_metadata_var
            else:
                for key in totals_for_metadata_var:
                    if key in totals[name]:
                        totals[name][key] += totals_for_metadata_var[key]
                    else:
                        totals[name][key] = totals_for_metadata_var[key]
    except (lxml.etree.XMLSyntaxError) as err:
        raise ValueError('Error parsing XML: {}'.format(err))
    return totals
