<nav id="results-menu">
  <span>Quick navigation:</span>
  <ul>
    <li><a href="#results-overview" title="See all results">Individual results</a></li>
    <li><a href="#download-overview" title="Download results">Download results</a></li>
    <li><a href="#query-overview" title="Query overview">Query overview</a></li>
  </ul>
</nav>

<section id="results-overview">
  <div class="btn-wrapper collapse">
    <button type="button" data-collapse="visible" title="Show or hide this section">
      <i class="fa fa-fw fa-angle-up" aria-hidden="true"></i>
      <span class="sr-only">Show or hide this section</span>
    </button>
  </div>
  <h2>Individual results</h2>
  <div class="results-ajax-wrapper" data-target="true">
    <p>Click on a sentence ID to view the tree structure. The part of the sentence matching your input structure is set in bold.</p>
    <?php
    if (isset($databaseGroups{$treebank}{$component}{'size'})):
      $componentSize = $databaseGroups{$treebank}{$component}{'size'};
      if ($componentSize > 1000000):
      ?>
    <p class="notice"><small><strong>Notice!</strong> You are querying a very large component, consisting of <strong><?php echo number_format($componentSize);?></strong> databases.
       <br>Searching through all of them can take a while!</small></p>
    <?php endif;
    endif;?>
    <?php include "$root/front-end-includes/results-controls.php"; ?>
    <?php require "$root/front-end-includes/results-table-wrapper.php"; ?>
  </div>
</section>

<section id="download-overview">
  <div class="btn-wrapper collapse">
    <button type="button" data-collapse="visible" title="Show or hide this section">
      <i class="fa fa-fw fa-angle-up" aria-hidden="true"></i>
      <span class="sr-only">Show or hide this section</span>
    </button>
  </div>
  <h2>Download results</h2>
  <div class="flex-content" data-target="true">
      <div class="results-messages-wrapper">
        <?php if ($treebank != 'sonar'): ?>
        <h3>Download results</h3>
      <?php endif; ?>
        <div class="messages">
        </div>
      </div>
      <?php if ($treebank != 'sonar'): ?>
      <div class="distribution-wrapper">
      <h3>Distribution list</h3>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
                <th>Treebank</th>
                <th>Hits</th>
                <th># sentences in treebank</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
      </div>
      <a href='<?php echo "tmp/$id-gretel-distribution.csv"; ?>' class="download-link"
        title="Download distribution" target="_blank" download="gretel-distribution.csv">
        <i class="fa fa-fw fa-download" aria-hidden="true"></i> Download distribution</a>
    </div>
  <?php endif; ?>
  </div>
</section>

<section id="query-overview">
  <div class="btn-wrapper collapse">
    <button type="button" data-collapse="visible" title="Show or hide this section">
      <i class="fa fa-fw fa-angle-up" aria-hidden="true"></i>
      <span class="sr-only">Show or hide this section</span>
    </button>
  </div>
  <h2>Query overview</h2>
  <div class="flex-content" data-target="true">
  <div>
    <div class="table-wrapper">
      <table>
        <tbody>
          <?php if ($currentPage == 'ebs'): ?>
            <tr><th>Input example</th><td><em><?php echo $example; ?></em></td></tr>
          <?php endif; ?>
          <tr><th>XPath</th><td><code style="font-size: 88%"><?php echo $xpath; ?></code></td></tr>
          <tr><th>Treebank</th><td><?php echo strtoupper($treebank)." [$component]"; ?></td></tr>
        </tbody>
      </table>
    </div>
    <a href="front-end-includes/save-xpath.php" class="download-link" title="Download XPath query" target="_blank" download="gretel-xpath.txt">
      <i class="fa fa-fw fa-download" aria-hidden="true"></i> Download XPath</a>
  </div>
    <p>You can save the XPath query to use the same query for another (part of a) treebank or for a slightly modified search without having to start completely
      from scratch.</p>
  </div>
</section>
