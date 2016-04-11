<?php
require "../config/config.php";
$currentPage="ebs";
$step=1;
session_start();
$id=session_id();
$next="parse.php";
$input="Dit is een zin."; // default example
require "$root/functions.php";
require "$root/php/head.php";
?>

<link rel="prefetch" href="<?php echo $home; ?>">
<link rel="prefetch" href="<?php echo $home; ?>/ebs/parse.php">
</head>


<?php require "$root/php/header.php"; ?>

            <form action="<?php echo $next; ?>" method="post" enctype="multipart/form-data">
                <p>Enter a <strong>sentence</strong> containing the (syntactic) characteristics you are looking for:</p>

                <?php
                if (isset($_SESSION['example'])) {
                  $input=$_SESSION['example'];
                }
                ?>

                <input type="text" name="input" value="<?php echo $input; ?>" id="example" />
                <button type="button" name="clear">Clear</button>

                <p>Select the <strong>search mode</strong> you want to use. <em>Basic search</em> doesn't
                    require any knowledge of the used formal query language, but it also has less
                    search options. <em>Advanced search</em> on the other hand allows a more specific
                    search and offers you the possibility to adapt the automatically generated XPath query.</p>
                <div class="label-wrapper"><label><input type="radio" name="search" value="basic" checked> Basic search</label></div>
                <div class="label-wrapper"><label><input type="radio" name="search" value="advanced"> Advanced search</label></div>
                <div class="continue-btn-wrapper"><button type="submit">Continue <i>&rarr;</i></button></div>
            </form>
        </main>
    </div>

    <?php
    require "$root/php/footer.php";
    include "$root/scripts/AnalyticsTracking.php";
    ?>
    <script src="<?php echo $home; ?>/js/TaalPortaal.js"></script>
    <script>
    $(document).ready(function() {
        $('[name="clear"]').click(function() {
            $(this).prev('[name="input"]').val("").focus();
        });
        taalPortaalFiller();
        <?php if($step > 1): ?>
        $(".progressbar li:nth-child(-n+<?php echo $step-1;?>)").addClass("done");
        <?php endif ?>
        $(".progressbar li:nth-child(<?php echo $step;?>)").addClass("active");
    });
    </script>
</body>
</html>
