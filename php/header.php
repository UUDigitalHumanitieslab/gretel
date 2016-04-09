<body <?php setBodyClasses(); ?>>
    <div id="container">
        <header class="page-header">
            <h1>GrETEL 2.0</h1>

            <nav class="primary-navigation">
                <ul>
                    <li><a href="<?php echo $home; ?>/index.php" title="Home"
                    <?= ($currentPage == "home") ? 'class="active"':''; ?>>Home</a></li>
                    <li><a href="<?php echo $home; ?>/ebs/input.php" title="Example-based search"
                    <?= ($currentPage == "ebs") ? 'class="active"':''; ?>>Example-based search</a></li>
                    <li><a href="<?php echo $home; ?>/xps/input.php" title="XPath search"
                    <?= ($currentPage == "xps") ? 'class="active"':''; ?>>XPath search</a></li>
                    <li><a href="<?php echo $home; ?>/documentation.php" title="Documentation"
                    <?= ($currentPage == "docs") ? 'class="active"':''; ?>>Documentation</a></li>
                </ul>
            </nav>
        </header>
        <main>
          <header <?= ($is_search)  ? 'class="progress-header"':''; ?>>
            <h1>
              <?php echo $pageTitle; ?>
              <?= ($is_search && $step > 1) ? "<span>$sm search mode</span>" : ""; ?>
            </h1>
            <?php if ($is_search) require "$root/php/secondary-navigation.php"; ?>
          </header>
          <?php
          if ($is_search) {
              echo "<h2><span>Step $step:</span> " . $searchStepTitles[$step-1] . "</h2>";
          }
          ?>
