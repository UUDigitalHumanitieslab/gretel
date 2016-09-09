<?php

require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = $_SESSION['ebsxps'];
$step = 4;

$continueConstraints = sessionVariablesSet(array('example', 'sentence'));

if ($continueConstraints) {
  $id = session_id();
  $input = $_SESSION['example'];

  $lpxml = simplexml_load_file("$tmp/$id-pt.xml");
}

require "$root/functions.php";
require "$php/head.php";
?>
</head>
<?php flush(); ?>
<?php
require "$php/header.php";

if ($continueConstraints) :
    // Set tokenized input sentence to variable
  $tokinput = $_SESSION['sentence'];
  $sentence = explode(' ', $tokinput);
    // add info annotation matrix to alpino parse
  foreach ($sentence as $begin => $word) {
      $postword = preg_replace('/\./', '_', $word);

      if (preg_match("/([_<>\.,\?!\(\)\"\'])|(\&quot;)|(\&apos;)/", $word)) {
          $xp = $lpxml->xpath("//node[@begin='$begin']");
      } else {
          $xp = $lpxml->xpath("//node[@word='$word' and @begin='$begin']");
      }

      if (isset($_POST["$postword--$begin"])) {
          $postvalue = $_POST["$postword--$begin"];
          foreach ($xp as $x) {
              $x->addAttribute('interesting', $postvalue);
              if ($postvalue == 'token' && !isset($_POST["$postword--$begin-case"])) {
                $x->addAttribute('casesensitive', 'no');
              }
          }
      }
  }
  // save parse with @interesting annotations
  $inttree = fopen("$tmp/$id-int.xml", 'w');
  $tree = $lpxml->asXML();
  fwrite($inttree, "$tree\n");
  fclose($inttree);

  // Remove top category?
  if (isset($_POST['topcat'])) {
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

  // generate XPath from sentence
  $attsout = '-ex postag,begin,end'; // attributes to be excluded from XPath
  $xpath = `perl -CS $scripts/XPathGenerator.pl -xml $tmp/$id-sub.xml $attsout $order`;
  $xpath = preg_replace('/@cat="\s+"/', '@cat', $xpath); // underspecify empty attribute values
  // Apply case (in)sensitivity where necessary
  $xpath = applyCs($xpath);
  $_SESSION['xpath'] = $xpath;

  session_write_close();

  if (!file_exists("$tmp/$id-sub.xml") || filesize("$tmp/$id-sub.xml") == 0 || !$continueConstraints) :
    setErrorHeading();
?>

    <p>No search instruction could be generated, since nothing was indicated in the matrix or no sentence was entered.
        It is also possible that you came to this page directly without first entering an input example.</p>
<?php
    setPreviousPageMessage(3);
else: ?>
  <p>You can search an entire treebank (default), or select just one or more components.
    For SoNaR it is currently only possible to select one component at a time. Due to pre-processing difficulties
    some sentences could not be included in the system, so the sentence and word counts may slightly differ from the official treebank counts.
    Additionally, some SoNaR components cannot be queried using GrETEL (yet), as they lack some of the linguisitic annotations.
    If this is fixed in an updated version of SoNaR, those components will be included as well.</p>

  <p>Which treebank do you want to query? Click on the treebank name to see its different components. If you would like to get more information
  on these treebanks, you can find their project websites in <a href="documentation.php#faq-3"
  title="Where can I find more information about the corpora available in GrETEL?">our FAQ</a>.</p>
  <form action="ebs/query.php" method="post">
    <div class="label-wrapper"><label><input type="radio" name="treebank" value="cgn"> CGN</label></div>
    <div class="label-wrapper"><label><input type="radio" name="treebank" value="lassy"> Lassy</label></div>
    <div class="label-wrapper"><label><input type="radio" name="treebank" value="sonar"> SoNaR</label></div>

    <div class="cgn" style="display:none">
      <?php require "$scripts/tb-cgn.php"; ?>
    </div>
    <div class="lassy" style="display:none">
      <?php require "$scripts/tb-lassy.php"; ?>
    </div>
    <div class="sonar" style="display:none">
      <?php require "$scripts/tb-sonar.php"; ?>
    </div>
    <?php setContinueNavigation(); ?>
  </form>
<?php endif; ?>

<?php
else:
  session_write_close();
  setErrorHeading(); ?>
  <p>No search instruction could be generated, since you did not enter a sentence.
    It is also possible that you came to this page directly without first entering a query.</p>
  <?php setPreviousPageMessage($step - 1);
endif;

require "$php/footer.php";
include "$root/scripts/AnalyticsTracking.php";
?>
</body>
</html>
