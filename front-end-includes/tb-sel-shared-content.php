<p>Which treebank do you want to query? Click on the treebank name to see its different components. If you would like to get more information
  on these treebanks, you can find the project websites in <a href="documentation.php#faq-3" target="_blank" title="More information on corpora">our FAQ</a>.</p>

<p>You can search an entire treebank, or select just one or more components. Due to pre-processing difficulties
  some sentences could not be included in the system, so the sentence and word counts may slightly differ from the official treebank counts.</p>

<?php
  $nextPage = ($currentPage == 'ebs') ? 'ebs/query.php' : 'xps/results.php';
?>

<form action="<?php echo $nextPage; ?>" method="post">
  <div class="flex-content">
    <div class="labels-wrapper">
      <div class="label-wrapper">
        <label>
          <input type="radio" name="treebank" value="cgn"> <strong>CGN treebank</strong>: spoken Dutch - version 2.0.1
        </label>
      </div>
      <div class="label-wrapper">
        <label>
          <input type="radio" name="treebank" value="lassy"> <strong>LASSY Small</strong>: written Dutch - version 1.1
        </label>
      </div>
      <div class="label-wrapper">
        <label>
          <input type="radio" name="treebank" value="sonar"> <strong>SoNaR treebank</strong>: written Dutch - version 1.0
        </label>
      </div>
    </div>
  </div>
  <div class="corpora-wrapper">
      <div class="cgn" style="display:none">
        <?php require ROOT_PATH."/front-end-includes/tb-cgn.php"; ?>
      </div>
      <div class="lassy" style="display:none">
        <?php require ROOT_PATH."/front-end-includes/tb-lassy.php"; ?>
      </div>
      <div class="sonar" style="display:none">
        <?php require ROOT_PATH."/front-end-includes/tb-sonar.php"; ?>
      </div>
  </div>
