<?php
require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private'); // avoids page reload when going back
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'ebs';
$step = 4;

$continueConstraints = sessionVariablesSet(array('example', 'sentence', 'search'));
$id = session_id();

if ($continueConstraints) {
    // Set input sentence to variable
    $input = $_SESSION['example'];
    // Set tokenized input sentence to variable
    $tokinput = $_SESSION['sentence'];
    $sentence = explode(' ', $tokinput);
    // Set search mode to variable
    $sm = $_SESSION['search'];

    $lpxml = simplexml_load_file("$tmp/$id-pt.xml");
}

require "$root/functions.php";
require "$root/php/head.php";

?>
</head>

<?php
require "$root/php/header.php";

if ($continueConstraints) {
    // add info annotation matrix to alpino parse
  foreach ($sentence as $begin => $word) {
      $postword = preg_replace('/\./', '_', $word);
      if (isset($_POST["$postword--$begin"])) $postvalue = $_POST["$postword--$begin"];

      if (preg_match("/([_<>\.,\?!\(\)\"\'])|(\&quot;)|(\&apos;)/", $word)) { //for punctuation (!) . changes to _ (!)
          $xp = $lpxml->xpath("//node[@begin='$begin']");
      } else {
          $xp = $lpxml->xpath("//node[@word='$word' and @begin='$begin']");
      }
      foreach ($xp as $x) {
          $x->addAttribute('interesting', "$postvalue");
      }
  }
  // save parse with @interesting annotations
  $inttree = fopen("$tmp/$id-int.xml", 'w');
  $tree = $lpxml->asXML();
  fwrite($inttree, "$tree");
  fclose($inttree);

  // get query tree
  if (isset($_POST['topcat'])) {
      $topcat = $_POST['topcat'];
      $remove = '-r relcat';
  } else {
      $remove = '-r rel';
  }

  `perl -CS $scripts/GetSubtree.pl -xml $tmp/$id-int.xml -m "sonar" $remove -split > $tmp/$id-sub.xml`;

  if (isset($_POST['order'])) {
      $order = '-order';
      $_SESSION['order'] = 'on';
  } else {
      $order = ' ';
  }

  // get XPath
  $attsout = '-ex postag,begin,end'; // attributes to be excluded from XPath
  $xpath = `perl -CS $scripts/XPathGenerator.pl -xml $tmp/$id-sub.xml $attsout $order`;
  $xpath = preg_replace('/@cat="\s+"/', '@cat', $xpath); // underspecify empty attribute values
  $_SESSION['xpath'] = $xpath;
}
?>

<?php if (!file_exists("$tmp/$id-sub.xml") || filesize("$tmp/$id-sub.xml") == 0 || !$continueConstraints) :
    setErrorHeading();
?>

    <p>No search instruction could be generated, since nothing was indicated in the matrix or no sentence was entered.
        It is also possible that you came to this page directly without first entering an input example.</p>
<?php
    getPreviousPageMessage(1);
else: ?>
  <p>You can search an entire treebank (default), or select just one or more components.
    For SoNaR it is currently only possible to select one component at a time. Due to pre-processing difficulties
    some sentences could not be included in the system, so the sentence and word counts may slightly differ from the official treebank counts.
    Additionally, some SoNaR components cannot be queried using GrETEL (yet), as they lack some of the linguisitic annotations.
    If this is fixed in an updated version of SoNaR, those components will be included as well.</p>

  <p>Which treebank do you want to query? Click on the treebank name to see its different components.</p>
  <form action="query.php" method="post" >
    <select name="treebank">
      <option value="cgn">CGN</option>
      <option value="lassy" selected>Lassy</option>
      <option value="sonar">SoNaR</option>
    </select>

    <div class="cgn" style="display:none">
      <?php require "$scripts/cgn-tb.html"; ?>
      <h3>Option</h3>
      <label><input type="checkbox" name="ct" value="on"> Include context (one sentence before and after the matching sentence)</label>
    </div>
    <div class="lassy">
      <?php require "$scripts/lassy-tb.html"; ?>
      <h3>Option</h3>
      <label><input type="checkbox" name="ct" value="on"> Include context (one sentence before and after the matching sentence)</label>
    </div>
    <div class="sonar" style="display:none">
      <?php require "$scripts/sonar-tb.html"; ?>
    </div>
    <div class="continue-btn-wrapper"><button type="submit">Continue <i>&rarr;</i></button></div>
  </form>
<?php endif; ?>

<?php
require "$root/php/footer.php";
include "$root/scripts/AnalyticsTracking.php";
?>

<?php if (file_exists("$tmp/$id-sub.xml") && (filesize("$tmp/$id-sub.xml") > 0) && $continueConstraints) : ?>
  <script>
  $(document).ready(function() {
      $('.checkall').click(function () {
        var checked = $(this).prop("checked");
        $("input[name^='lassytb']:not([disabled])").prop("checked", checked);
      });
      $('.checkvlfunction').click(function () {
        var checked = $(this).prop("checked");
        $("input[name^='cgntb[v']:not([disabled])").prop("checked", checked);
      });
      $('.checknlfunction').click(function () {
        var checked = $(this).prop("checked");
        $("input[name^='cgntb[n']:not([disabled])").prop("checked", checked);
      });

      $("select[name='treebank']").change(function(){
          var val = $(this).val();
          $(".cgn, .lassy, .sonar").hide();
          $("."+val).show();
      });
  });
  </script>
<?php endif; ?>
</body>
</html>
