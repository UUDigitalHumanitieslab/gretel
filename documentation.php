<?php

$currentPage="docs";

require "config.php";
require ROOT_PATH."/helpers.php";
require ROOT_PATH."/functions.php";
require ROOT_PATH."/front-end-includes/head.php";
?>
</head>

        <?php require ROOT_PATH."/front-end-includes/header.php"; ?>
            <p>This page gathers all sorts of documentation on and information about GrETEL. Below, you can find tutorials, related tools,
                frequently asked questions, and other information. If you have any more questions, you can always
                <a href="documentation.php#faq-4" title="FAQ how to contact us">contact us</a>.</p>
            <p>As stated on the home page, we would ask you to cite the following paper if you are using GrETEL for your research.</p>
            <cite>
              <a href="http://nederbooms.ccl.kuleuven.be/documentation/LREC2012-ebq.pdf"
              title="Example-Based Treebank Querying" target="_blank">
              <span class="stack">
                <i class="fa fa-file-text-o"></i>
                <i class="fa fa-download"></i>
              </span>
              <span class="sr-only">Example-Based Treebank Querying</span>
             </a>
              <p>
                Liesbeth Augustinus, Vincent Vandeghinste, and Frank Van Eynde (2012).
                <strong>"Example-Based Treebank Querying"</strong>. In: <em>Proceedings of the 8th International Conference on Language Resources and Evaluation (LREC-2012)</em>.
                Istanbul, Turkey. pp. 3161-3167.
              </p>
            </cite>
            <div class="flex-content">
                <article>
                    <h2>Tutorials</h2>
                    <ul>
                    <li><a href="http://gretel.ccl.kuleuven.be/docs/GrETEL2-tutorial.pdf" title="Gretel slides" target="_blank">Slides</a></li>
                    <li><a href="http://gretel.ccl.kuleuven.be/docs/GrETEL2-tutorial-handson.pdf" title="Gretel exercises" target="_blank">Exercises</a></li>
                    <li><a href="http://nederbooms.ccl.kuleuven.be/documentation/EducationalModule.pdf" title="CLARIN Educational Module" target="_blank">CLARIN Educational Module</a></li>
                    <li><a href="http://www.meertens.knaw.nl/mimore/educational_module/case_study_mimore_gretel.html" title="Combined Case Study MIMORE - GrETEL" target="_blank">Combined Case Study MIMORE - GrETEL</a></li>
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
                    <li><a href="http://gretel.ccl.kuleuven.be/afribooms" title="GrETEL 4 Afrikaans" target="_blank">GrETEL 4 Afrikaans</a></li>
                    <li><a href="http://gretel.ccl.kuleuven.be/poly-gretel" title="Poly-GrETEL" target="_blank">Poly-GrETEL</a></li>
                    </ul>
                </article>
            </div>
            <section id="faq">
                <h2>Frequently Asked Questions</h2>
                <dl>
                    <dt id="faq-1">Why is the output limited to 500 sentences?</dt>
                    <dd><p>The reason is two-fold. For one, it might take very long for a query with
                    more than 500 results to finish. More importantly, though, the corpora provided by us are
                    <strong>not meant for distribution</strong>. In other words, we do not have the rights to give out the corpus
                    as a whole. If a user would search for a structure with only a <code>cat="top"</code> node, they could
                    literally download the whole corpus - which is not the intention of this project.</p></dd>

                    <dt id="faq-2">For whom is GrETEL intended?</dt>
                    <dd><p>GrETEL is designed as a corpus query tool which means that it is useful for anyone who is
                    interested in searching through Lassy, CGN, or SoNaR. However, the tool is especially dedicated to
                    those looking for <em>specific linguistic patterns</em> in these corpora.</p></dd>

                    <dt id="faq-3">Where can I find more information about the corpora available in GrETEL?</dt>
                    <dd><p>GrETEL currently provides access to three corpora: Lassy Small, CGN (Corpus Gesproken Nederlands), and SoNaR. More information on these corpora is provided on
                      <a href="http://gretel.ccl.kuleuven.be/project/docs.php#treebanks" target="_blank" title="Go to the project page">GrETEL's project page</a>.</p>
                      <ul>
                        <li><a href="http://www.let.rug.nl/~vannoord/Lassy/" target="_blank" title="The project page of Lassy Small">Lassy Small</a>
                          was the first corpus to be supported in GrETEL. It is a one-million words corpus
                          that consists of written data. All of its annotations have been manually checked and verified.</li>
                        <li><a href="http://tst-centrale.org/images/stories/producten/documentatie/cgn_website/doc_English/topics/index.htm" target="_blank" title="The project page of Corpus Gesproken Nederlands">Corpus Gesproken Nederlands</a>,
                          or CGN for short, is a corpus of one million words that consists of transcribed Dutch speech.
                          All the provided annotations have been manually checked and verified.</li>
                        <li><a href="http://lands.let.ru.nl/projects/SoNaR/" target="_blank" title="The project page of SoNaR">SoNaR</a>,
                          is different from Lassy and the CGN in that it is much larger. It is a corpus that consists of 25 components of written data,
                        amounting to 500 million words. Because of its size, the syntactic annotations have not been manually verified.</li>
                      </ul>
                    </dd>

                    <dt id="faq-4">How can I contact you?</dt>
                    <dd><p>This website and this tool were developed at the Centre for Computational Linguistics (CCL). If you have any suggestions,
                      questions, or general feedback you are welcome to give us a ring, or send us an email. You can find contact information on
                      <a href="http://www.arts.kuleuven.be/ling/ccl" title="Centre for Computational Linguistics homepage" target="_blank">CCL's website</a> or
                      in the footer of this website.</p></dd>

                     <dt id="faq-5">Why does XPath generated for SoNaR only have one leading slash, when the code for Lassy and CGN has two?</dt>
                     <dd><p>It has to do with how XPath structures work on the one hand, and how we optimised the SoNaR database on the other. The
                         first question is rather easy to understand: a double slash makes sure that the following pattern is searched for in all
                         descendants of the current node (or implied root), whereas the single slash restricts the search to its direct children.
                         How that difference is relevant for SoNaR has been described in the paper cited below.</p>
                         <cite>
                           <a href="http://www.lrec-conf.org/proceedings/lrec2014/workshops/LREC2014Workshop-CMLC2%20Proceedings-rev2.pdf#page=20"
                           title="Download 'Making Large Treebanks Searchable. The SoNaR case.'" target="_blank">
                           <span class="stack">
                             <i class="fa fa-file-text-o"></i>
                             <i class="fa fa-download"></i>
                           </span>
                           <span class="sr-only">Download 'Making Large Treebanks Searchable. The SoNaR case.'</span>
                          </a>

                           <p>Vincent Vandeghinste and Liesbeth Augustinus. (2014). <strong>"Making Large Treebanks Searchable. The SoNaR case"</strong>.
                             In: Marc Kupietz, Hanno Biber, Harald Lüngen, Piotr Bański, Evelyn Breiteneder, Karlheinz Mörth, Andreas Witt &amp; Jani Takhsha (eds.),
                             <em>Proceedings of the LREC2014 2nd workshop on Challenges in the management of large corpora (CMLC-2)</em>. Reykjavik, Iceland. pp. 15-20.
                           </p>
                         </cite>
                     </dd>
                </dl>
            </section>
        </main>
    </div>

    <?php
    require ROOT_PATH."/front-end-includes/footer.php";
    include ROOT_PATH."/front-end-includes/analytics-tracking.php";
    ?>
</body>
</html>
