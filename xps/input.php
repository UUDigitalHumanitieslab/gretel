<?php
/**
 * Takes XPath input from a user to query in a BaseX Client.
 *
 * A user inputs a valid XPath structure that will be queried in Basex. The XPath is
 * briefly validated before submitting (in js/scripts.js) check opening/closing tags match),
 * and fully parsed in the next step(s).
 *
 * @author Liesbeth Augustinus
 * @author Bram Vanroy
 */

require '../config/config.php';
require "$root/helpers.php";

session_start();
header('Content-Type:text/html; charset=utf-8');

// Unset previous session ID, we don't want one session to span multiple queries
session_regenerate_id(FALSE);
session_unset();

$_SESSION['ebsxps'] = 'xps';
$currentPage = $_SESSION['ebsxps'];
$step = 1;
$taalPortaal = true;

$id = session_id();
if (!empty($_SESSION['xpath'])) {
    $xpath = $_SESSION['xpath'];
    $xpath = preg_replace('/^\/{0,2}node/', '//node', $xpath);
} else {
    $xpath = '//node[@cat="smain" and node[@rel="su" and @pt="vnw"] and node[@rel="hd" and @pt="ww"] and node[@rel="predc" and @cat="np" and node[@rel="det" and @pt="lid"] and node[@rel="hd" and @pt="n"]]]';
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
