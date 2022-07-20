class DatabaseSearcher:
    """A class to search within one BaseX database according to a given
    XPath, starting position and maximum number of results."""

    def __init__(self, session, basex_db: str, xpath: str, start=None,
                 end=None):
        self.session = session
        self.basex_db = basex_db
        self.xpath = xpath
        self.start = start
        self.end = end
        self.update_xquery()

    def update_xquery(self):
        """Update XQuery for counting and searching if the search variables
        have been manually changed."""
        self.xquery_search = self.generate_xquery_search(
            self.basex_db, self.xpath, self.start, self.end
        )
        self.xquery_count = self.generate_xquery_count(
            self.basex_db, self.xpath
        )

    @classmethod
    def generate_xquery_search(self, basex_db: str, xpath: str, start=None,
                               end=None) -> str:
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

        # Apply paging if a start and end number are given
        if not(start is None and end is None):
            if start is None or end is None:
                raise ValueError(
                    'start and end arguments can only be None together'
                )
            query = '({})[position() = {} to {}]'.format(query, start + 1, end)
        return query

    @classmethod
    def generate_xquery_count(self, basex_db: str, xpath: str) -> str:
        return 'count(for $node in db:open("{}")/treebank{} return $node)' \
            .format(basex_db, xpath)

    def search(self) -> str:
        """Search according to prepared XQuery and return matches in XML as a
        string"""
        try:
            result = self.session.query(self.xquery_search).execute()
        except OSError as err:
            raise RuntimeError(
                'Searching failed: {}'.format(str(err))
            )
        return result

    def count(self) -> int:
        """Count according to prepared XQuery and return the number of matches
        as an integer"""
        try:
            result = self.session.query(self.xquery_count).execute()
            count = int(result)
        except OSError as err:
            raise RuntimeError(
                'Searching failed: {}'
                .format(str(err))
            )
        except ValueError:
            raise RuntimeError(
                'Counting did not result in an integer - result was: {}'
                .format(result)
            )
        return count
