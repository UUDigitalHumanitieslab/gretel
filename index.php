<?php
require "/config/config.php";
$currPage="home";
require "$root/php/head.php";
?>
</head>

        <?php require "$root/php/header.php"; ?>

            <p>GrETEL stands for <strong>Gr</strong>eedy <strong>E</strong>xtraction of <strong>T</strong>rees for
                <strong>E</strong>mpirical <strong>L</strong>inguistics. It is a user-friendly search engine for
                the exploitation of treebanks, text corpora with syntactic annotations. If you are new to this
                search engine we highly recommend that you first take a look at
                <a href="<?php echo $home; ?>/documentation.php">the documentation on the topic</a>.
                Tutorials as well as scientific papers are available.</p>
            <p> The tool allows to search in treebanks without knowledge about the tree representations, treebank
                query languages, nor the specific linguistic theories in the treebank. The user provides the query
                engine with an example sentence, marking which parts of the sentence are the focus of the query.
                Through automated parsing of the example sentence and subtree extraction of the sentence part
                under focus the treebank is queried for the extracted subtree. GrETEL then returns sentences similar
                to the input example. GrETEL is available in two formats:</p>

            <h3><a href="<?php echo $home; ?>/ebs/input.php">Example-based search</a></h3>

            <p>In this search mode you can use a natural language example as a starting point for searching
                a treebank with limited knowledge about tree representations and formal query languages.
                The formal (XPath) query is automatically generated. In this type of search Three different
                corpora can be queried: CGN, Lassy, and SoNaR.</p>

            <h3><a href="<?php echo $home; ?>/xps/input-xp.php">XPath search</a></h3>

            <p>In this search mode you have to build the XPath query yourself. We strongly recommend to use the
                XPath search tool only when you are an experienced XPath user! Also note that because of the size of
                the corpus, SoNaR is not accessible in this search mode because of the scale of the corpus and the
                possible complexity of XPath code. Lassy and CGN are available.</p>

            <p>Please cite the following paper if you are using GrETEL for your research:</p>
            <blockquote style="border-left: 4px solid #968A7A; padding-left: 1em;">Liesbeth Augustinus, Vincent Vandeghinste, and Frank Van Eynde (2012).
                <a href="http://nederbooms.ccl.kuleuven.be/documentation/LREC2012-ebq.pdf" target="_blank">"Example-Based Treebank Querying"</a>
                In: Proceedings of the 8th International Conference on Language Resources and Evaluation (LREC-2012).
                Istanbul, Turkey. pp. 3161-3167</p></blockquote>
        </main>
    </div>

    <?php
    require "$root/php/footer.php";
    include "$root/scripts/AnalyticsTracking.php";
    ?>
</body>
</html>
