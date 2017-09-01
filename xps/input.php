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

$currentPage = 'xps';
$step = 1;

require "../config.php";
require ROOT_PATH."/helpers.php";

session_start();
header('Content-Type:text/html; charset=utf-8');

$xpath = '//node[@cat="smain"
	and node[@rel="su" and @pt="vnw"]
	and node[@rel="hd" and @pt="ww"]
	and node[@rel="predc" and @cat="np"
		and node[@rel="det" and @pt="lid"]
		and node[@rel="hd" and @pt="n"]]]';
$xpath = isset($_SESSION['xpath']) ? $_SESSION['xpath'] : $xpath;
// Unset previous session ID, we don't want one session to span multiple queries
session_regenerate_id(false);
session_unset();

$id = session_id();

require ROOT_PATH."/functions.php";
require ROOT_PATH."/front-end-includes/head.php";
?>
</head>
<?php flush(); ?>
<?php require ROOT_PATH."/front-end-includes/header.php"; ?>
    <form action="xps/tb-sel.php" method="post" enctype="multipart/form-data">
        <p>Enter an <strong>XPath expression</strong> containing the (syntactic) characteristics you are looking for:</p>
        <xpath-editor autofocus data-root-url="/<?= basename($_SERVER['CONTEXT_DOCUMENT_ROOT']) ?>/macros.txt">
          <textarea name="xpath" id="xpath"><?php echo $xpath; ?></textarea>
        </xpath-editor>
        <xpath-variables data-name="xpath-variables" data-source="#xpath"></xpath-variables>
        <?php setContinueNavigation(); ?>
    </form>

    <?php
    require ROOT_PATH."/front-end-includes/footer.php";
    include ROOT_PATH."/front-end-includes/analytics-tracking.php";
    ?>
</body>
</html>
