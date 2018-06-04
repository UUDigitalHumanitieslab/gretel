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
 session_start();
 header('Content-Type:text/html; charset=utf-8');

$currentPage = 'xps';
$step = 1;

require '../config.php';
require ROOT_PATH.'/helpers.php';

$xpath = '//node[@cat="smain"
	and node[@rel="su" and @pt="vnw"]
	and node[@rel="hd" and @pt="ww"]
	and node[@rel="predc" and @cat="np"
		and node[@rel="det" and @pt="lid"]
		and node[@rel="hd" and @pt="n"]]]';

define('SID', session_id().'-'.time());
$_SESSION[SID] = array();
$_SESSION[SID]['queryid'] = SID;

require ROOT_PATH.'/functions.php';
require ROOT_PATH.'/front-end-includes/head.php';
?>
</head>
<?php flush(); ?>
<?php require ROOT_PATH.'/front-end-includes/header.php'; ?>
    <form action="xps/tb-sel.php" method="post" enctype="multipart/form-data">
        <p>Enter an <strong>XPath expression</strong> containing the (syntactic) characteristics you are looking for:</p>
        <textarea class="xpath-editor" autofocus data-macros-url="<?= HOME_PATH; ?>macros.txt" name="xpath" id="xpath"><?php echo $xpath; ?></textarea>
        <data class="xpath-variables" data-name="xpath-variables" data-source="#xpath"></div>
        <input type="hidden" name="sid" value="<?php echo SID; ?>">
        <?php setContinueNavigation(); ?>
    </form>

    <?php
    require ROOT_PATH.'/front-end-includes/footer.php';
    include ROOT_PATH.'/front-end-includes/analytics-tracking.php';
    ?>
</body>
</html>
