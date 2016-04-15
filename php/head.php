<!DOCTYPE html>
<?php error_reporting(E_ALL);
ini_set('display_errors', 1); ?>
<head>
<title><?php setPageTitle(); ?></title>
<meta name="description" content="">

<?php if ($is_bigstep): ?>
  <meta name="robots" content="noindex">
<?php endif; ?>
<link rel="shortcut icon" type="image/png" href="<?php echo $home; ?>/img/gretel_logo_trans.png">

<script src="https://code.jquery.com/jquery-2.2.2.min.js" integrity="sha256-36cp2Co+/62rEAAYHLmRCPIych47CvdM+uTBJwSzWjI=" crossorigin="anonymous"></script>

<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,400italic|Roboto+Condensed">
<link rel="stylesheet" href="<?php echo $home; ?>/style/css/styles.css">


<?php // Prefetch links. Don't prefetch too much, only required stuff. ?>
<?php if (isset($currentPage) && $currentPage != 'home'): ?>
    <link rel="prefetch" href="<?php echo $home; ?>">
<?php else:
    $ebsKeys = array_keys($ebsPages);
    $xpsKeys = array_keys($xpsPages);
?>
    <link rel="prefetch" href="<?php echo $home; ?>/ebs/<?php echo $ebsKeys[0]; ?>">
    <link rel="prefetch" href="<?php echo $home; ?>/xps/<?php echo $xpsKeys[0]; ?>">
    <link rel="prefetch" href="<?php echo $home; ?>/documentation.php">
<?php endif;?>

<?php if (isset($currentPage, $step) && $step < count(${$currentPage.'Pages'})):
    $keys = array_keys(${$currentPage.'Pages'});
?>
    <link rel="prefetch" href='<?php echo $home.'/'.$currentPage.'/'.$keys[$step]; ?>'>
<?php endif;?>
