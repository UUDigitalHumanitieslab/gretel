<body class="<?php echo $currPage; ?>">
    <div id="container">
        <header class="page-header">
            <h1>GrETEL 2.0</h1>

            <nav class="primary-navigation">
                <ul>
                    <li><a href="<?php echo $home; ?>/index.php" title="Home"
                    <?= ($currPage == "home") ? 'class="active"':''; ?>>Home</a></li>
                    <li><a href="<?php echo $home; ?>/ebs/input.php" title="Example-based search"
                    <?= ($currPage == "ebs") ? 'class="active"':''; ?>>Example-based search</a></li>
                    <li><a href="<?php echo $home; ?>/xps/input.php" title="XPath search"
                    <?= ($currPage == "xps") ? 'class="active"':''; ?>>XPath search</a></li>
                    <li><a href="<?php echo $home; ?>/documentation.php" title="Documentation"
                    <?= ($currPage == "docs") ? 'class="active"':''; ?>>Documentation</a></li>
                </ul>
            </nav>
        </header>
        <main>
            <?php
                $is_search = (isset($currPage) && ($currPage == "ebs" || $currPage=="xps")) ? 1 : 0;
                if (isset($currPage)) {
                    if ($currPage == "home") $pageTitle = "What is GrETEL?";
                    elseif ($currPage == "ebs") {
                        $pageTitle = "Example-based search";
                        if (isset($step)) {
                            $searchStepTitles = array(
                                "Give an input example",
                                "Input parse",
                                "Select relevant parts",
                                "Select a treebank",
                                "Query overview",
                                "Results"
                            );
                        }
                    }
                    elseif ($currPage == "xps") {
                        $pageTitle = "XPath search";

                        if (isset($step)) {
                            $searchStepTitles = array(
                                "Give an XPath expression",
                                "Select a treebank",
                                "Results"
                            );
                        }
                    }
                    elseif ($currPage == "docs") $pageTitle = "Documentation";
                }
            ?>
            <h1><?php echo $pageTitle; ?>
                <?php
                if ($is_search && $step > 1) {
                    echo "<span>$sm search mode</span>";
                }
                ?>
            </h1>
            <?php
            if ($is_search) {
                echo '<header class="step-header">';
                require "$root/php/secondary-navigation.php";
                echo "<h2><span>Step $step:</span> " . $searchStepTitles[$step-1] . "</h2>";
                echo '</header>';
            }
            ?>
