<body <?php setBodyClasses(); ?>>
    <div id="container">
        <header class="page-header">
            <h1>GrETEL <sup class="version">4</sup> <sup>alpha!</sup></h1>
            <p>Greedy Extraction of Trees for Empirical Linguistics</p>
            <nav class="primary-navigation">
                <ul>
                    <li><a href="../home" title="Home"
                    <?php if ($currentPage == "home") echo 'class="active"'; ?>>Home</a></li>
                    <li><a href="ebs/input.php" title="Example-based search"
                    <?php if ($currentPage == "ebs") echo 'class="active"'; ?>>Example-based search</a></li>
                    <li><a href="xps/input.php" title="XPath search"
                    <?php if ($currentPage == "xps") echo 'class="active"'; ?>>XPath search</a></li>
                    <li><a href="../documentation" title="Documentation"
                    <?php if ($currentPage == "docs") echo 'class="active"'; ?>>Documentation</a></li>
                </ul>
                <button name="show-menu">
                  <i class="fa fa-fw fa-bars" aria-hidden="true"></i>
                  <span class="sr-only">Open the mobile menu</span>
                </button>
            </nav>
        </header>
        <main>

          <header <?php if (isSearch() && isset($pageHeading)) echo 'class="progress-header"'; ?>>
            <h1>
              <?php if (isset($pageHeading)) echo $pageHeading; ?>
            </h1>
            <?php if (isSearch()) {
              require ROOT_PATH."/front-end-includes/secondary-navigation.php";
            }
            else if (isHome() || isDocs()) {?>
              <div class="project-web-wrapper">
                <a href="http://gretel.ccl.kuleuven.be/project/" title="Go to the project website" target="_blank">GrETEL project website<i class="fa fa-external-link" aria-hidden="true"></i></a>
              </div>
            <?php }
            ?>
          </header>
          <?php if (isSearch()) echo "<h2><span>Step $step:</span> " . $searchStepHeadings[$step-1] . "</h2>"; ?>
