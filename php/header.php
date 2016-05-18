<body <?php setBodyClasses(); ?>>
    <div id="container">
        <header class="page-header">
            <h1>GrETEL</h1>
            <h2>Greedy Extraction of Trees for Empirical Linguistics</h2>
            <nav class="primary-navigation">
                <ul>
                    <li><a href="<?php echo $home; ?>/index.php" title="Home"
                    <?php if ($currentPage == "home") echo 'class="active"'; ?>>Home</a></li>
                    <li><a href="<?php echo $home; ?>/ebs/input.php" title="Example-based search"
                    <?php if ($currentPage == "ebs") echo 'class="active"'; ?>>Example-based search</a></li>
                    <li><a href="<?php echo $home; ?>/xps/input.php" title="XPath search"
                    <?php if ($currentPage == "xps") echo 'class="active"'; ?>>XPath search</a></li>
                    <li><a href="<?php echo $home; ?>/documentation.php" title="Documentation"
                    <?php if ($currentPage == "docs") echo 'class="active"'; ?>>Documentation</a></li>
                </ul>
                <button name="show-menu" hidden><i class="fa fa-bars"></i></button>
            </nav>
        </header>
        <main>
          <header <?php if ($is_search) echo 'class="progress-header"'; ?>>
            <h1>
              <?php echo $pageHeading; ?>
              <?php if ($is_search && $is_bigstep && isset($sm)) echo "<span>$sm search mode</span>"; ?>
            </h1>
            <?php if ($is_search) require "$root/php/secondary-navigation.php"; ?>
          </header>
          <?php if ($is_search) echo "<h2><span>Step $step:</span> " . $searchStepHeadings[$step-1] . "</h2>"; ?>
