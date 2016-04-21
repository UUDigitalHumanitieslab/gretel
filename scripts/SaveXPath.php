<?php
session_cache_limiter('private'); // avoids page reload when going back
session_start();

/*
  SaveXPath.php
  script exports XPath query to a file (as xp)

  version 0.3 date: 15.10.2014  RELEASED WITH GrETEL2.0
  written by Liesbeth Augustinus (c) 2014
  for the GrETEL2.0 project

*/

/***********************************************************/
 /* VARIABLES */
$id=session_id();
$date=date('d-m-Y');
$time=time(); // time stamp

/* GET VARIABLES */
$xpath=$_SESSION['xpath'];

/***********************************************************/

// get XPath

header("Content-Disposition: attachment; filename=XPath.xp");
header("Content-type:text/plain; charset=utf-8");

print "$xpath\n";

?>
