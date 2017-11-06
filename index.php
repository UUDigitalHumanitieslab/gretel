<?php

$currentPage = 'home';
require "config.php";
require ROOT_PATH."/helpers.php";
require ROOT_PATH."/functions.php";
require ROOT_PATH."/front-end-includes/head.php";
?>
</head>



        <?php require ROOT_PATH."/front-end-includes/header.php"; ?>
            <p style="text-align: center; padding: 10px; margin-bottom: 10px; background-color: #F2DEDE; border: 1px solid red;">
              <em>
              This is a development version for GrETEL which includes functionality to upload your own corpus and faceted search. All features are experimental and might break unexpectedly. <br> Please <a style="color: #505050;" href="http://gretel.ccl.kuleuven.be/">navigate to the official version</a> if you want to use GrETEL for research purposes.
              </em>
            </p>
            <p>GrETEL stands for <strong>Gr</strong>eedy <strong>E</strong>xtraction of <strong>T</strong>rees for
                <strong>E</strong>mpirical <strong>L</strong>inguistics. It is a user-friendly search engine for
                the exploitation of syntactically annotated coropra or <i>treebanks</i>. If you are new to GrETEL
                we recommend you to take a look at the <a href="documentation.php" title="Documentation">documentation</a>.
            </p>

            <p>GrETEL has two search modes:</p>
            <p><b><a href="ebs/input.php">Example-based search</a></b> enables you to use a natural language example as a starting point for searching
  a treebank. The query procedure consists of several steps, which allows you to define how similar the search results and the input example should be. In this way you can query a treebank without knowledge of the XPath query language, the tree representations, nor the exact grammar implementation used for the annotation of the trees.</p>            

            <p><b><a href="xps/input.php">XPath search</a></b> enables you to query a treebank by means of an XPath query. This search mode is intended for experienced XPath users, as you need to build the XPath query yourself.</p>

            <?php if (API_URL): ?>
              <p><b><a href="../gretel-upload">Corpus upload</a></b> allows you to upload your own corpus to GrETEL.</p>
            <?php endif; ?>

                <div class="citation-wrapper">
  <p style="margin-top:0">Please cite the following paper if you have used GrETEL for your research:</p>
                <cite>
                  <a href="http://gretel.ccl.kuleuven.be/docs/Augustinus2012-ebq-LREC.pdf"
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
