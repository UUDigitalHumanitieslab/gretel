<?php

$currentPage = 'home';

require "config.php";
require ROOT_PATH."/helpers.php";
require ROOT_PATH."/functions.php";
require ROOT_PATH."/front-end-includes/head.php";
?>
</head>

        <?php require ROOT_PATH."/front-end-includes/header.php"; ?>
            <p>GrETEL stands for <strong>Gr</strong>eedy <strong>E</strong>xtraction of <strong>T</strong>rees for
                <strong>E</strong>mpirical <strong>L</strong>inguistics. It is a user-friendly search engine for
                the exploitation of treebanks, text corpora with syntactic annotations. If you are new to this
                search engine we highly recommend that you first take a look at
                <a href="documentation.php" title="Documentation">the documentation on the topic</a>.
                Tutorials as well as scientific papers are available.
                On that page you can also find a section called
                <a href="documentation.php#faq" title="Frequently Asked Questions">Frequently Asked Questions</a>.</p>
            <p> The tool allows to search in treebanks without knowledge about the tree representations, treebank
                query languages, nor the specific linguistic theories in the treebank. The user provides the query
                engine with an example sentence, marking which parts of the sentence are the focus of the query.
                Through automated parsing of the example sentence and subtree extraction of the sentence part
                under focus the treebank is queried for the extracted subtree. GrETEL then returns sentences similar
                to the input example.</p>

            <p><strong style="font-size: 88%">GrETEL provides two search approaches, introduced below.</strong></p>
            <h3><a href="ebs/input.php">Example-based search</a></h3>

            <p>In this search mode you can use a natural language example as a starting point for searching
                a treebank with limited knowledge about tree representations and formal query languages.
                The formal (XPath) query is automatically generated. In this type of search three different
                corpora can be queried: CGN, Lassy, and SoNaR.</p>

            <h3><a href="xps/input.php">XPath search</a></h3>

            <p>In this search mode you have to build the XPath query yourself. We strongly recommend to use the
                XPath search tool only when you are an experienced XPath user! You can query CGN, Lassy, and SoNaR here as well.</p>

                <div class="citation-wrapper">
                <p style="margin-top:0">Please cite the following paper if you are using GrETEL for your research. More documentation such as
                  tutorials, papers and slides can be found on
                  <a href="documentation.php" title="GrETEL documentation">the documentation page</a>.</p>
                <cite>
                  <a href="http://nederbooms.ccl.kuleuven.be/documentation/LREC2012-ebq.pdf"
                    title="Download Example-Based Treebank Querying" target="_blank">
                    <span class="stack">
                      <i class="fa fa-file-text-o"></i>
                      <i class="fa fa-download"></i>
                    </span>
                    <span class="sr-only">Download Example-Based Treebank Querying</span>
                 </a>
                  <p>
                    Liesbeth Augustinus, Vincent Vandeghinste, and Frank Van Eynde (2012).
                    <strong>"Example-Based Treebank Querying"</strong>. In: <em>Proceedings of the 8th International Conference on Language Resources and Evaluation (LREC-2012)</em>.
                    Istanbul, Turkey. pp. 3161-3167.
                  </p>
                </cite>
              </div>
        </main>
    </div>

    <?php
    require ROOT_PATH."/front-end-includes/footer.php";
    include ROOT_PATH."/front-end-includes/analytics-tracking.php";
    ?>
</body>
</html>
