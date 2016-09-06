<body <?php setBodyClasses(); ?>>
    <div id="container">
        <header class="page-header">
            <h1>GrETEL <sup>3.0</<sup></h1>
            <p>Greedy Extraction of Trees for Empirical Linguistics</p>
            <nav class="primary-navigation">
                <ul>
                    <li><a href="index.php" title="Home"
                    <?php if ($currentPage == "home") echo 'class="active"'; ?>>Home</a></li>
                    <li><a href="ebs/input.php" title="Example-based search"
                    <?php if ($currentPage == "ebs") echo 'class="active"'; ?>>Example-based search</a></li>
                    <li><a href="xps/input.php" title="XPath search"
                    <?php if ($currentPage == "xps") echo 'class="active"'; ?>>XPath search</a></li>
                    <li><a href="documentation.php" title="Documentation"
                    <?php if ($currentPage == "docs") echo 'class="active"'; ?>>Documentation</a></li>
                </ul>
                <button name="show-menu" hidden><i class="fa fa-fw fa-bars"></i></button>
            </nav>
        </header>
        <main>

          <header <?php if ($is_search && isset($pageHeading)) echo 'class="progress-header"'; ?>>
            <h1>
              <?php if (isset($pageHeading)) echo $pageHeading; ?>
              <?php if ($is_search && $is_bigstep && isset($searchMode)) echo "<span>$searchMode search mode</span>"; ?>
            </h1>
            <?php if ($is_search) require "$php/secondary-navigation.php"; ?>
          </header>
          <?php if ($is_search) echo "<h2><span>Step $step:</span> " . $searchStepHeadings[$step-1] . "</h2>"; ?>
