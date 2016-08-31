<!DOCTYPE html>
<html lang="en">

<?php
require '../config/config.php';
session_start();

$currentPage = $_SESSION['ebsxps'];
$id = session_id();

require "$root/functions.php";
?>

<head>
    <title>Messages for the results page</title>
    <meta name="robots" content="noindex">
</head>

<body>
  <?php
  $fetchResultsPath = "$home/php/flush-results.php";
  $getAllResultsPath = "$home/php/get-all-results.php";
  $fetchCountsPath = "$home/php/fetch-counts.php";
  $downloadPath = "$home/tmp/$id-gretel-results.txt";
  ?>

  <div id="results-found">
    <p>
      <strong class="amount-hits">--</strong> result(s) have/has been found! <small class="is-still-counting">(still counting, can take a while)</small><br>
      <span class="is-restricted" style="display: none;">We have restricted the output to 500 hits. You can find the reason for this
        <a href='<?php echo "$home/documentation.php#faq-1"; ?>' title="Why is the output limited to 500 sentences?" target="_blank">in our FAQ</a>.<br>
      </span>
      <a href="<?php echo $downloadPath; ?>" title="Download results" class="download-link" target="_blank" download="gretel-results.txt">
        <i class="fa fa-fw fa-arrow-down"></i> Save results</a>
    </p>
    <small>
      <a href='<?php echo "$home/documentation.php#faq-6"; ?>' style="float: right;" title="FAQ: what is inside the download file" target="_blank">What is inside this file?</a>
    </small>
  </div>
  <div id="no-results-found">
      <strong>No results were found!</strong>
      <?php setPreviousPageMessage(1); ?>
  </div>
  <div id="error">
      <strong>Error! <span class="error-msg"></span></strong>
      <?php setPreviousPageMessage(1); ?>
  </div>
  <div id="looking-for-tree">
    <p>It seems that you want to open a tree in a new window. The tree first needs to be found again, but as soon as it is found it will pop up.</p>
  </div>
</body>

</html>
