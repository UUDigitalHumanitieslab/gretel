<html>
<!-- index.php -->
<!-- GrETEL info -->

<!-- version 0.2 date: 14.10.2014  RELEASED WITH GrETEL2.0 -->
<!-- written by Liesbeth Augustinus (c) 2014 -->
<!-- for the GrETEL2.0 project -->

<head>
<title>GrETEL 2.0</title>
<link rel="stylesheet" type="text/css" href="style/css/gretel.css"></link>
<link rel="stylesheet" type="text/css" href="style/css/tooltip.css"></link>
<link href="http://fonts.googleapis.com/css?family=Oswald:400,300,700|Carrois+Gothic" rel="stylesheet" type="text/css">
<link rel="shortcut icon" type="image/png" href="img/gretel_logo_trans.png" />

<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script type="text/javascript" src="js/tooltip.js" ></script>
<script type="text/javascript" src="js/browserDetection.js" ></script>
<?php include_once("scripts/AnalyticsTracking.php") ?>
</head>

<body>
<div id="container">

<h1>GrETEL 2.0</h1>
<hr>

<h2>What is GrETEL?</h2>

<p>GrETEL stands for <b>Gr</b>eedy <b>E</b>xtraction of <b>T</b>rees for <b>E</b>mpirical <b>L</b>inguistics. It is a user-friendly search engine for the exploitation of treebanks. It comes in two formats:</br>

<h4><a href="ebs/input.php">Example-based search</a></h4>

<p>In this search mode you can use a natural language example as a starting point for searching a treebank<a href="#" class="clickMe" tooltip="A text corpus with syntactic annotations"> <sup>[?]</sup></a> with limited knowledge about tree representations and formal query languages.<a href="#" class="clickMe" tooltip="The formal (XPath) query is automatically generated"> <sup>[?]</sup></a></br>

<h4><a href="xps/input-xp.php">XPath search</a></h4>

<p>In this search mode you have to build the XPath query yourself. We strongly recommend to use the XPath search tool only when you are an experienced XPath user!</p>
<br/>

</div>
</body>
</html>
