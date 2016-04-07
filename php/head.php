<!DOCTYPE html>
<head>
<?php
    if (isset($pagetitle)) {
        $pagetitle .= ' | GrETEL';
    } else {
        $pagetitle = 'GrETEL | An example based search engine for corpora';
    }
?>
<title><?php echo $pagetitle; ?></title>
<meta name="description" content="">
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700,400italic|Roboto+Condensed" rel="stylesheet" >
<link href="style/css/styles.css" rel="stylesheet" >

<link href="img/gretel_logo_trans.png" rel="shortcut icon" type="image/png" >

<script src="https://code.jquery.com/jquery-2.2.2.min.js" integrity="sha256-36cp2Co+/62rEAAYHLmRCPIych47CvdM+uTBJwSzWjI=" crossorigin="anonymous"></script>
