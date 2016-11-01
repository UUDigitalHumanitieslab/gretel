<p>You can search an entire treebank (default), or select just one or more components. Due to pre-processing difficulties
  some sentences could not be included in the system, so the sentence and word counts may slightly differ from the official treebank counts.</p>

<p>Which treebank do you want to query? Click on the treebank name to see its different components. If you would like to get more information
  on these treebanks, you can find their project websites in <a href="documentation.php#faq-3">our FAQ</a>.</p>

<?php
  $nextPage = ($currentPage == 'ebs') ? 'ebs/query.php' : 'xps/results.php';
?>

<form action="<?php echo $nextPage; ?>" method="post">
  <div class="flex-content">
    <div class="labels-wrapper">
      <div class="label-wrapper">
        <label>
          <input type="radio" name="treebank" value="cgn"> CGN
        </label>
      </div>
      <div class="label-wrapper">
        <label>
          <input type="radio" name="treebank" value="lassy"> Lassy
        </label>
      </div>

      <?php if ($currentPage == 'ebs'): ?>
      <div class="label-wrapper">
        <label>
          <input type="radio" name="treebank" value="sonar"> SoNaR
        </label>
      </div>
    <?php endif; ?>
    </div>
    <p class="notice"><strong>Notice!</strong> We are currently improving the efficiency of our dataset. Therefore some components may not be available at the moment.
  Please try again at a later time if you want to search through these temporarily unavailable components.</p>
  </div>
  <div class="corpora-wrapper">
      <div class="cgn" style="display:none">
        <?php require "$root/front-end-includes/tb-cgn.php"; ?>
      </div>
      <div class="lassy" style="display:none">
        <?php require "$root/front-end-includes/tb-lassy.php"; ?>
      </div>
      <?php if ($currentPage == 'ebs'): ?>
        <div class="sonar" style="display:none">
          <?php require "$root/front-end-includes/tb-sonar.php"; ?>
        </div>
      <?php endif; ?>
  </div>
