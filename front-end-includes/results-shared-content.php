<nav id="results-menu">
  <span>Quick navigation:</span>
  <ul>
    <li><a href="#results" title="See all results">Individual results</a></li>
    <li><a href="#download" title="Download results">Download results</a></li>
    <li><a href="#query-overview" title="Query overview">Query overview</a></li>
  </ul>
</nav>
<section id="results">
  <div class="results-ajax-wrapper">
    <h2>Individual results</h2>
    <p>Click on a sentence ID to view the tree structure.</p>
    <?php include "$root/front-end-includes/results-controls.php"; ?>
    <?php require "$root/front-end-includes/results-table-wrapper.php"; ?>
  </div>
</section>
<section id="download">
  <h2>Download results</h2>
    <div class="content">
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
    <h2>Query overview</h2>
    <div class="flex-content">
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
