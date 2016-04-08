<?php
require "/config/config.php";
$currPage="docs";
require "$root/php/head.php";
?>
</head>

        <?php require "$root/php/header.php"; ?>
            <p>Explanatory paragraph</p>
            <p>As stated on the home page, we would ask you to cite the following paper if you are using GrETEL for your research:</p>
            <blockquote style="border-left: 4px solid #968A7A; padding-left: 1em;">Liesbeth Augustinus, Vincent Vandeghinste, and Frank Van Eynde (2012).
                <a href="http://nederbooms.ccl.kuleuven.be/documentation/LREC2012-ebq.pdf" target="_blank">"Example-Based Treebank Querying"</a>
                In: Proceedings of the 8th International Conference on Language Resources and Evaluation (LREC-2012).
                Istanbul, Turkey. pp. 3161-3167</p></blockquote>
            <div class="flex-content">
                <article>
                    <h2>Tutorials</h2>
                    <ul>
                    <li><a href="http://gretel.ccl.kuleuven.be/docs/GrETEL2-tutorial.pdf" target="_blank">Slides</a></li>
                    <li><a href="http://gretel.ccl.kuleuven.be/docs/GrETEL2-tutorial-handson.pdf" target="_blank">Exercises</a></li>
                    <li><a href="http://nederbooms.ccl.kuleuven.be/documentation/EducationalModule.pdf" target="_blank">CLARIN Educational Module</a></li>
                    <li><a href="http://www.meertens.knaw.nl/mimore/educational_module/case_study_mimore_gretel.html" target="_blank">Combined Case Study MIMORE - GrETEL</a></li>
                    </ul>
                </article>
                <article>
                    <h2>Information</h2>
                    <ul>
                    <li><a href="http://gretel.ccl.kuleuven.be/project" target="_blank">Project website</a></li>
                    <li><a href="http://gretel.ccl.kuleuven.be/project/docs.php" target="_blank">Manuals and documentation</a></li>
                    <li><a href="http://gretel.ccl.kuleuven.be/project/publications.php" target="_blank">Publications and Talks</a></li>
                    </ul>
                </article>
                <article>
                    <h2>Related tools</h2>
                    <ul>
                    <li><a href="http://gretel.ccl.kuleuven.be/afribooms" target="_blank">GrETEL 4 Afrikaans</a></li>
                    <li><a href="http://gretel.ccl.kuleuven.be/poly-gretel" target="_blank">Poly-GrETEL</a></li>
                    </ul>
                </article>
            </div>
        </main>
    </div>

    <?php
    require "$root/php/footer.php";
    include "$root/scripts/AnalyticsTracking.php";
    ?>
</body>
</html>
