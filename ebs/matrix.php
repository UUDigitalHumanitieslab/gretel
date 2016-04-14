<?php
require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private'); // avoids page reload when going back
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'ebs';
$step = 3;

$continueConstraints = sessionVariablesSet(array('example', 'sentence', 'search'));

if ($continueConstraints) {
    $id = session_id();
    $time = time();

    // Set input sentence to variable
    $input = $_SESSION['example'];
    // Set tokenized input sentence to variable
    $tokinput = $_SESSION['sentence'];
    $sentence = explode(' ', $tokinput);
    // Set search mode to variable
    $sm = $_SESSION['search'];
}

require "$root/functions.php";
require "$root/php/head.php";

if ($continueConstraints) : ?><link rel="stylesheet" href="<?php echo $home; ?>/style/css/tree-visualizer.css"><?php endif; ?>
</head>

<?php
require "$root/php/header.php";

if ($continueConstraints):
?>
  <form action="tb-sel.php" method="post">
      <p>In the matrix below, the elements of the sentence you entered are divided in obligatory ones and optional ones.
          The latter do not need to be represented in the search results. The obligatory elements have to be included in
          the results, be it as an element of the same word class, any form of a specific lemma, or a specific word form.
      </p>
      <p>If you would like to review the dependency structure of your input example,
          you can view a dependency parse of that sentence in the tree structure given
          <a href='<?php echo "$home/tmp/$id.xml?$id-$time"; ?>' target="_blank" class="tv-show-fs">here</a>.
      </p>
      <p>Indicate the relevant  parts of the sentence, i.e. the parts you are interested in. If you have chosen
          <em>advanced mode</em> in step 1 you have two more options to choose from, namely
          <em>detailed word class</em> and <em>not in search</em>. A detailed description of each option is
          given at the bottom of this page.
      </p>
      <div class="table-wrapper">
          <?php buildEbsMatrix(); ?>
      </div>

  <h3>Options</h3>
  <div class="label-wrapper"><label><input type="checkbox" name="order" value="on"> Respect word order</label></div>
  <div class="label-wrapper"><label><input type="checkbox" name="topcat" value="on">
  Ignore properties of the dominating node. Clicking this option allows you to search
  for more general patterns, e.g. search for both main clauses and subclauses.
  </label></div>

  <h3>Guidelines</h3>
  <ul>
    <li><strong>word</strong>: The exact word form. This is a case sensitive feature.</li>
    <li><strong>lemma</strong>: Word form that generalizes over inflected forms.
    For example: <em>zin</em> is the lemma of <em>zin, zinnen</em>, and <em>zinnetje</em>;
    <em>gaan</em> is the lemma of <em>ga, gaat, gaan, ging, gingen</em>, and <em>gegaan</em>.
    Lemma is case insensitive (except for proper names).</li>
    <li><strong>word class</strong>: Short Dutch part-of-speech tag.
    The different tags are: <code>n</code> (noun), <code>ww</code> (verb), <code>adj</code> (adjective),
    <code>lid</code> (article), <code>vnw</code> (pronoun), <code>vg</code> (conjunction),
    <code>bw</code> (adverb), <code>tw</code> (numeral), <code>vz</code> (preposition),
    <code>tsw</code> (interjection), <code>spec</code> (special token), and <code>let</code> (punctuation).</li>
    <li><strong>optional in search</strong>: The word will be ignored in the search instruction.
        It may be included in the results, but it is not necessary.</li>

    <?php if ($sm == 'advanced'): ?>
        <li><strong>detailed word class</strong>: Long part-of-speech tag. For example: <tt>N(soort,mv,basis), WW(pv,tgw,ev),  VNW(pers,pron,nomin,vol,2v,ev)</tt>.</li>
      <li><strong>NOT in search</strong>: The word class and the dependency relation will be excluded from the search instruction.
          They will not be included in the results.</li>
    <?php endif; ?>
  </ul>
  <div class="continue-btn-wrapper"><button type="submit">Continue <i>&rarr;</i></button></div>
</form>
<?php
else:
    setErrorHeading('variables undefined');
?>
    <p>It seems that you did not enter an input sentence or you did not select a search mode in step 1. It is
     is also possible that you came to this page directly without first entering an input example.</p>
<?php
getPreviousPageMessage(1);
endif;

require "$root/php/footer.php";
include "$root/scripts/AnalyticsTracking.php";

if ($continueConstraints): ?>

  <script src="<?php echo $home; ?>/js/tree-visualizer.js"></script>
  <script>
  $(document).ready(function () {
      // Specific implementation of the Tree Visualizer plugin for GrETEL:
      // allows refreshing of page, opening tree in new window and so on
  	var tvLink = $("a.tv-show-fs");

      tvLink.each(function(index) {
          $(this).attr("data-tv-url", $(this).attr("href"));
          $(this).attr("href", "#tv-" + (index + 1));
      });
      tvLink.click(function(e) {
          var $this = $(this);

          window.history.replaceState("", document.title, window.location.pathname + window.location.search + $this.attr("href"));
          $("body").treeVisualizer($this.data("tv-url"), {
              normalView: false,
              initFSOnClick: true
          });
          e.preventDefault();
      });
      var hash = window.location.hash;
      if (hash) {
          if (hash.indexOf("tv-") == 1) {
              var index = hash.match(/\d+$/);
              tvLink.eq(index[0] - 1).click();
          }
      }
  });
  </script>
<?php endif; ?>
</body>
</html>
