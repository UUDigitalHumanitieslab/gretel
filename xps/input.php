<?php
require '../config/config.php';
require "$root/helpers.php";

session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'xps';
$step = 1;
$taalPortaal = true;

$id = session_id();
if (isset($_SESSION['xpath'])) {
    $xpath = $_SESSION['xpath'];
} else {
    $xpath = '//node[@rel="su" and @cat="np" and node[@pt="n" and @ntype="eigen"]]';
}

require "$root/functions.php";
require "$root/php/head.php";
?>
</head>
<?php flush(); ?>
<?php require "$root/php/header.php"; ?>
    <form action="tb-sel.php" method="post" enctype="multipart/form-data">
        <p>Enter an <strong>XPath expression</strong> containing the (syntactic) characteristics you are looking for:</p>
        <div class="input-wrapper">
            <textarea name="xpath" wrap="soft" required><?php echo $xpath; ?></textarea>
            <button type="reset" name="clear" title="Empty the input field"><i class="fa fa-times"></i></button>
        </div>
        <?php setContinueNavigation(); ?>
    </form>

    <?php
    require "$root/php/footer.php";
    include "$root/scripts/AnalyticsTracking.php";
    ?>
</body>
</html>
