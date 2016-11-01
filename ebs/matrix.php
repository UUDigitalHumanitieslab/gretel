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

 $currentPage = 'ebs';
 $step = 3;

 require '../config/config.php';
 require "$root/helpers.php";

 session_cache_limiter('private');
 session_start();
 header('Content-Type:text/html; charset=utf-8');

$continueConstraints = sessionVariablesSet(array('example', 'sentence'));

if ($continueConstraints) {
    $treeVisualizer = true;
    $id = session_id();

    $input = $_SESSION['example'];
}

require "$root/functions.php";
require "$root/front-end-includes/head.php";

?>
</head>
<?php flush(); ?>
<?php
require "$root/front-end-includes/header.php";

if ($continueConstraints):
  // Set tokenized input sentence to variable
  $tokinput = $_SESSION['sentence'];
  $sentence = explode(' ', $tokinput);
?>
<form action="ebs/tb-sel.php" method="post">
  <p>In the matrix below, the sentence you entered has been tokenized, i.e. divided into elements that are separated by spaces.
    Indicate the relevant parts of the sentence, i.e. the parts you are interested in. A detailed description of each option is
    given at the bottom of this page.
  </p>
  <div class="flex-content">
    <div class="input-wrapper">
      <div class="advanced-btn-wrapper">
        <button type="button" title="Show advanced options">
          <span>Show advanced options</span>
          <i class="fa fa-cog" aria-hidden="true" style="margin-left: 4px"></i>
        </button>
      </div>
      <div class="table-wrapper">
        <?php buildEbsMatrix(); ?>
      </div>
    </div>

    <div class="xpath-wrapper">
      <div>
        <h3 style="margin-top: 0">Search options</h3>
        <div class="label-wrapper">
          <label>
            <input type="checkbox" name="order" aria-describedby="order-tooltip"> Respect word order
          </label>
          <div class="help-tooltip" id="order-tooltip" role="tooltip" data-title="Only search for patterns that have the same word order as your input example">
            <i class="fa fa-fw fa-info-circle" aria-hidden="true"></i>
            <span class="sr-only">Only search for patterns that have the same word order as your input example</span>
          </div>
        </div>
        <div class="label-wrapper">
          <label>
            <input type="checkbox" name="ct" value="on" aria-describedby="ct-tooltip"> Include context in results
          </label>
          <div class="help-tooltip" id="ct-tooltip" data-title="In the results, show the sentence before and after the matching sentence to provide a broader context">
            <i class="fa fa-fw fa-info-circle" aria-hidden="true"></i>
            <span class="sr-only">In the results, show the sentence before and after the matching sentence to provide a broader context</span>
          </div>
        </div>
        <div class="label-wrapper">
          <label>
            <input type="checkbox" name="topcat" aria-describedby="topcat-tooltip"> Ignore properties of the dominating node
          </label>
          <div class="help-tooltip" id="topcat-tooltip" role="tooltip" data-title="Search for more general patterns by ignoring the properties of the top node, e.g. search for both main clauses and subclauses">
            <i class="fa fa-fw fa-info-circle" aria-hidden="true"></i>
            <span class="sr-only">Search for more general patterns by ignoring the properties of the top node, e.g. search for both main clauses and subclauses</span>
          </div>
        </div>
      </div>

      <div>
        <h3 class="advanced-option">Modify XPath</h3>
        <input type="hidden" name="originalXp" value="">
        <input type="hidden" name="manualMode" value="false">

        <textarea id="xpath" class="advanced-option" name="xpath" spellcheck="false" wrap="soft" required></textarea>
        <div class="open-beautifier-wrapper advanced-option">
          <input type="reset" value="Reset XPath" style="font-size: 88%">

          <a href="http://bramvanroy.be/projects/xpath-beautifier/" title="Open and edit this XPath in the XPath Beautifier" aria-describedby="beautifier-tooltip" target="_blank">
            Open in XPath Beautifier
            <i class="fa fa-external-link" aria-hidden="true"></i>
          </a>

          <div class="help-tooltip" id="beautifier-tooltip" role="tooltip" data-title="The XPath Beautifier allows you to edit an expanded version of the XPath code given here.
          This makes it easier to apply any adjustments. When you're done, copy the XPath code back in the field below.">
            <i class="fa fa-fw fa-info-circle" aria-hidden="true"></i>
            <span class="sr-only">The XPath Beautifier allows you to edit an expanded version of the XPath code given here.
              This makes it easier to apply any adjustments. When you're done, copy the XPath code back in the text field above.</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <aside id="tree-output"></aside>

  <div class="guidelines">
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
      <li class="advanced-option"><strong>detailed word class</strong>: Long part-of-speech tag. For example: <code>N(soort,mv,basis)</code>, <code>WW(pv,tgw,ev)</code>, <code>VNW(pers,pron,nomin,vol,2v,ev)</code>.</li>
      <li><strong>optional in search</strong>: The word will be ignored in the search instruction.
          It may be included in the results, but it is not required that it is present.</li>
      <li class="advanced-option"><strong>not in search</strong>: The word class and the dependency relation will be excluded from the results.</li>
    </ul>
    <p><strong>Note on case-sensitivity.</strong> As outlined above, the <code>word</code> feature can be made case-sensitive.
      By default case-sensitivity is <em>disabled</em> (the search is case-insensitive). If you want to change the importance of case you can tick the checkbox for case-sensitivity.
      Obviously, this option is only available for the <code>word</code> feature and not for punctuation.</p>
    </p>
  </div>
  <?php setContinueNavigation(); ?>
</form>

<?php
else:
  setErrorHeading(); ?>
  <p>No search instruction could be generated, since you did not enter a sentence.
    It is also possible that you came to this page directly without first entering a query.</p>
  <?php setPreviousPageMessage($step-1);
endif;

session_write_close();

require "$root/front-end-includes/footer.php";
include "$root/front-end-includes/analytics-tracking.php";
?>

<script>
    var getTreePathScript = <?php echo json_encode("$home/preparatory-scripts/process-input-example.php"); ?>;
</script>
</body>
</html>
