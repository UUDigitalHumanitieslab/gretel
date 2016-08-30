<!DOCTYPE html>
<html lang="en">
<head>
<title><?php setPageTitle(); ?></title>
<meta name="description" content="GrETEL is an online tool that facilitates the exploitation of treebanks, large pieces of text that are syntactically annotated, by only requiring an input example instead of a formal query, or hard to understand computer code.">
<meta name="keywords" content="GrETEL, treebank, sonar, cgn, lassy, grind, dependency, syntax, dutch, corpus, example based, ccl, centre for computational linguistics">

<?php if ($is_bigstep): ?>
  <meta name="robots" content="noindex">
<?php endif; ?>

<link rel="icon" type="image/png" href="<?php echo $home; ?>/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="<?php echo $home; ?>/favicon-16x16.png" sizes="16x16">

<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,400italic|Roboto+Condensed:400">
<link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.6.3/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-T8Gy5hrqNKT+hzMclPo118YTQO6cYprQmhrYwIiQ/3axmI1hQomh7Ud2hPOy8SP1" crossorigin="anonymous">
<link rel="stylesheet" href="<?php echo $home; ?>/style/css/min/styles.min.css">

<?php if (isset($treeVisualizer) && $treeVisualizer): ?>
  <link rel="stylesheet" href="<?php echo $home; ?>/style/css/min/tree-visualizer.min.css">
<?php endif; ?>

<?php
  // Prefetch links. Don't prefetch too much, only required required pages such as
  // the home page, or the next page in the process
?>
<?php if (isset($currentPage) && $currentPage != 'home'): ?>
    <link rel="prefetch" href="<?php echo $home; ?>">
    <?php if (isset($step) && $step < count(${$currentPage.'Pages'})):
        $keys = array_keys(${$currentPage.'Pages'});
    ?>
        <link rel="prefetch" href='<?php echo $home.'/'.$currentPage.'/'.$keys[$step]; ?>'>
    <?php endif;?>
<?php else:
    $ebsKeys = array_keys($ebsPages);
    $xpsKeys = array_keys($xpsPages);
?>
    <link rel="prefetch" href="<?php echo $home; ?>/ebs/<?php echo $ebsKeys[0]; ?>">
    <link rel="prefetch" href="<?php echo $home; ?>/xps/<?php echo $xpsKeys[0]; ?>">
    <link rel="prefetch" href="<?php echo $home; ?>/documentation.php">
<?php endif;?>
