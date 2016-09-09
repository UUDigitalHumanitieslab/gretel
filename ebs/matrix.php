<?php
/**
 * EBS STEP 3: Shows the user a matrix where they can select word-per-word information
 * that they want queried.
 *
 * The sentence given in the previous step is tokenized. Based on the tokens, a matrix is build.
 * The user can select what information is information for them, e.g. lemma, pos-tag, word,
 * and so on..
 *
 *Also two search-wide options are available:
 * 1. Respect word order;
 * 2. Ignore properties of top node.
 *
 * @author Liesbeth Augustinus
 * @author Bram Vanroy
 *
 * @see /functions.php  buildEbsMatrix(), isSpam()
 */

require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = $_SESSION['ebsxps'];
$step = 3;

$continueConstraints = sessionVariablesSet(array('example', 'sentence'));

if ($continueConstraints) {
    $id = session_id();

    $input = $_SESSION['example'];
}

require "$root/functions.php";
require "$php/head.php";

// Check if $input contains email addresses or website URLs
$isSpam = ($continueConstraints) ? isSpam($input) : false;
?>
</head>
<?php flush(); ?>
<?php
require "$php/header.php";

if ($continueConstraints && !$isSpam):
  // Set tokenized input sentence to variable
  $tokinput = $_SESSION['sentence'];
  $sentence = explode(' ', $tokinput);
?>
  <form action="ebs/tb-sel.php" method="post">
      <p>In the matrix below, the sentence you entered has been tokenized, i.e. divided into elements that are separated by spaces.
        Indicate the relevant parts of the sentence, i.e. the parts you are interested in. A detailed description of each option is
          given at the bottom of this page.
      </p>
      <div class="table-wrapper">
          <?php buildEbsMatrix(); ?>
      </div>

  <h3>Options</h3>
  <div class="label-wrapper">
    <label>
    <input type="checkbox" name="order"> Respect word order
    </label>
    <div class="help-tooltip" data-title="Only search for patterns that have the same word order as your input example">
      <i class="fa fa-fw fa-info-circle" aria-hidden="true"></i>
      <span class="sr-only">Only search for patterns that have the same word order as your input example</span>
    </div>
  </div>
  <div class="label-wrapper">
    <label>
      <input type="checkbox" name="topcat"> Ignore properties of the dominating node
    </label>
    <div class="help-tooltip" data-title="Search for more general patterns by ignoring the properties of the top node,
      e.g. search for both main clauses and subclauses">
      <i class="fa fa-fw fa-info-circle" aria-hidden="true"></i>
      <span class="sr-only">Search for more general patterns by ignoring the properties of the top node,
        e.g. search for both main clauses and subclauses</span>
    </div>
  </div>

  <h3>Guidelines</h3>
  <ul>
    <li><strong>word</strong>: The exact word form. <strong>This is a case sensitive feature (cf. below).</strong></li>
    <li><strong>lemma</strong>: Word form that generalizes over inflected forms.
      For example: <em>zin</em> is the lemma of <em>zin, zinnen</em>, and <em>zinnetje</em>;
      <em>gaan</em> is the lemma of <em>ga, gaat, gaan, ging, gingen</em>, and <em>gegaan</em>.</li>
    <li><strong>word class</strong>: Short Dutch part-of-speech tag.
    The different tags are: <code>n</code> (noun), <code>ww</code> (verb), <code>adj</code> (adjective),
    <code>lid</code> (article), <code>vnw</code> (pronoun), <code>vg</code> (conjunction),
    <code>bw</code> (adverb), <code>tw</code> (numeral), <code>vz</code> (preposition),
    <code>tsw</code> (interjection), <code>spec</code> (special token), and <code>let</code> (punctuation).</li>
    <li><strong>detailed word class</strong>: Long part-of-speech tag. For example: <code>N(soort,mv,basis)</code>, <code>WW(pv,tgw,ev)</code>, <code>VNW(pers,pron,nomin,vol,2v,ev)</code>.</li>
    <li><strong>optional in search</strong>: The word will be ignored in the search instruction.
        It may be included in the results, but it is not required that it is present.</li>
    <li><strong>not in search</strong>: The word class and the dependency relation will be excluded from the results.</li>
  </ul>
  <p><strong>Note on case-sensitivity.</strong> As outlined above, the <code>word</code> feature can be made case-sensitive.
    By default case-sensitivity is <em>disabled</em> (the search is case-insensitive). If you want to change the importance of case you can tick the checkbox for case-sensitivity.
    Obviously, this option is only available for the <code>word</code> feature and not for punctuation.</p>
  </p>
  <?php setContinueNavigation(); ?>
</form>
<?php
else:
    if ($isSpam):
        setErrorHeading("Spam detected"); ?>
        <p>Your input example contained a hyperlink or email address and is seen as spam. Therefore we will not allow you to continue. </p>
    <?php else:
        setErrorHeading(); ?>
        <p>No search instruction could be generated, since you did not enter a sentence.
            It is also possible that you came to this page directly without first entering a query.</p>
    <?php endif;
    setPreviousPageMessage($step-1);
endif;

session_write_close();

require "$php/footer.php";
include "$root/scripts/AnalyticsTracking.php";
?>
</body>
</html>
