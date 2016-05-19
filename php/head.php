<!DOCTYPE html>
<html lang="en">
<head>
<title><?php setPageTitle(); ?></title>
<meta name="description" content="">

<?php if ($is_bigstep): ?>
  <meta name="robots" content="noindex">
<?php endif; ?>
<link rel="shortcut icon" type="image/png" href="<?php echo $home; ?>/img/gretel_logo_trans.png">

<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,400italic|Roboto+Condensed">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.1/css/font-awesome.min.css" integrity="sha384-hQpvDQiCJaD2H465dQfA717v7lu5qHWtDbWNPvaTJ0ID5xnPUlVXnKzq7b8YUkbN" crossorigin="anonymous">
<link rel="stylesheet" href="<?php echo $home; ?>/style/css/styles.min.css">

<?php if (isset($treeVisualizer) && $treeVisualizer): ?>
  <link rel="stylesheet" href="<?php echo $home; ?>/style/css/tree-visualizer.min.css">
<?php endif; ?>

<?php
  // Prefetch links. Don't prefetch too much, only required required pages such as
  // the home page, or the next page in the process
?>
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
