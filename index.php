<?php
require "config/config.php";
require 'php/head.php';
?>
</head>

<body>
    <div id="container">
        <header class="page-header">
            <h1>GrETEL 2.0</h1>

            <nav class="primary-navigation">
                <ul>
                    <li><a href="#" title="Home" class="active">Home</a></li>
                    <li><a href="#" title="Example-based search">Example-based search</a></li>
                    <li><a href="#" title="XPath search">XPath search</a></li>
                    <li><a href="#" title="Documentation">Documentation</a></li>
                </ul>
            </nav>
        </header>
        <section>
            <h2>What is GrETEL?</h2>

            <p>GrETEL stands for <strong>Gr</strong>eedy <strong>E</strong>xtraction of <strong>T</strong>rees for
                <strong>E</strong>mpirical <strong>L</strong>inguistics.
                It is a user-friendly search engine for the exploitation of treebanks. It comes in two formats:</p>

            <h3><a href="ebs/input.php">Example-based search</a></h3>

            <p>In this search mode you can use a natural language example as a starting point for searching
                a treebank (a text corpus with syntactic annotations) with limited knowledge about
                tree representations and formal query languages. The formal (XPath) query is automatically generated</p>

            <h3><a href="xps/input-xp.php">XPath search</a></h3>

            <p>In this search mode you have to build the XPath query yourself. We strongly recommend to use the
                XPath search tool only when you are an experienced XPath user!</p>

            <p>Please cite the following paper if you are using GrETEL for your research:</p>
            <blockquote style="border-left: 4px solid #968A7A; padding-left: 1em;">Liesbeth Augustinus, Vincent Vandeghinste, and Frank Van Eynde (2012).
                <a href="http://nederbooms.ccl.kuleuven.be/documentation/LREC2012-ebq.pdf" target="_blank">"Example-Based Treebank Querying"</a>
                In: Proceedings of the 8th International Conference on Language Resources and Evaluation (LREC-2012).
                Istanbul, Turkey. pp. 3161-3167</p></blockquote>
        </section>
        <aside id="documentation">
            <h2>Documentation</h2>
            <h3>Tutorials</h3>
            <ul>
            <li><a href="http://gretel.ccl.kuleuven.be/docs/GrETEL2-tutorial.pdf" target="_blank">Slides</a></li>
            <li><a href="http://gretel.ccl.kuleuven.be/docs/GrETEL2-tutorial-handson.pdf" target="_blank">Exercises</a></li>
            <li><a href="http://nederbooms.ccl.kuleuven.be/documentation/EducationalModule.pdf" target="_blank">CLARIN Educational Module</a></li>
            <li><a href="http://www.meertens.knaw.nl/mimore/educational_module/case_study_mimore_gretel.html" target="_blank">Combined Case Study MIMORE - GrETEL</a></li>
            </ul>

            <h3>Information</h3>
            <ul>
            <li><a href="http://gretel.ccl.kuleuven.be/project" target="_blank">Project website</a></li>
            <li><a href="http://gretel.ccl.kuleuven.be/project/docs.php" target="_blank">Manuals and documentation</a></li>
            <li><a href="http://gretel.ccl.kuleuven.be/project/publications.php" target="_blank">Publications and Talks</a></li>
            </ul>

            <h3>Related tools</h3>
            <ul>
            <li><a href="http://gretel.ccl.kuleuven.be/afribooms" target="_blank">GrETEL 4 Afrikaans</a></li>
            <li><a href="http://gretel.ccl.kuleuven.be/poly-gretel" target="_blank">Poly-GrETEL</a></li>
            </ul>
        </aside>
    </div>

    <?php
    require 'php/footer.php';
    include 'scripts/AnalyticsTracking.php';
    ?>
</body>
</html>
