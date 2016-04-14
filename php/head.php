<!DOCTYPE html>
<?php error_reporting(E_ALL);
ini_set('display_errors', 1); ?>
<head>
<title><?php setPageTitle(); ?></title>
<meta name="description" content="">

<?php if ($is_bigstep): ?>
  <meta name="robots" content="noindex">
<?php endif; ?>

<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,400italic|Roboto+Condensed" rel="stylesheet" >
<link href="<?php echo $home; ?>/style/css/styles.css" rel="stylesheet" >

<link href="<?php echo $home; ?>/img/gretel_logo_trans.png" rel="shortcut icon" type="image/png" >

<script src="https://code.jquery.com/jquery-2.2.2.min.js" integrity="sha256-36cp2Co+/62rEAAYHLmRCPIych47CvdM+uTBJwSzWjI=" crossorigin="anonymous"></script>

<link rel="prefetch" href="<?php echo $home; ?>">
<?php if (isset($currentPage, $step) && $step < count(${$currentPage.'Pages'})): ?>
<link rel="prefetch" href='<?php echo $home.'/'.$currentPage.'/'.${$currentPage.'Pages'}[$step]; ?>'>
<?php endif;?>
