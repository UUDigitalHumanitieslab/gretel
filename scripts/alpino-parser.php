<?php
/**
 * version 0.3 date: 14.10.2014  RELEASED WITH GrETEL2.0
 * written by Liesbeth Augustinus (c) 2014
 * for the GrETEL2.0 project
 */

function alpino($sentence,$id) {
  require("../config/config.php"); // load configuration file to get Alpino variables ($alpinoHome and $tmp)

  $descriptorspec = array(
			  0 => array("pipe", "r"),  // stdin is a pipe that the child will read from
			  1 => array("pipe", "w"),  // stdout is a pipe that the child will write to
			  2 => array("file", "/tmp/alpino.log", "a") // stderr is a file to write to
			  );

  $cwd = '/';
  $env = array('ALPINO_HOME' => "$alpinoHome");
  $alpino = "$alpinoHome/bin/Alpino -notk -veryfast max_sentence_length=20 user_max=180000 -end_hook=xml -flag treebank $tmp -parse";

  $process = proc_open($alpino, $descriptorspec, $pipes, $cwd, $env);

  if (!is_resource($process)) {
   die('error');
  }
  if (is_resource($process)) {
    // $pipes now looks like this:
    // 0 => writeable handle connected to child stdin
    // 1 => readable handle connected to child stdout
    // Any error output will be appended to /tmp/error-output.txt

    // write sentence to standard input of Alpino
    fwrite($pipes[0], "$id|$sentence");
    fclose($pipes[0]);

    // read results and print on web page
    while (($buffer = fgets($pipes[1], 4096)) !== false) {
      //       echo $buffer."\n";
    }
    fclose($pipes[1]);

    // It is important that you close any pipes before calling
    // proc_close in order to avoid a deadlock
    $return_value = proc_close($process);

    //    echo "command returned $return_value\n";
  }

  return "$tmp/$id.xml"; //return parse location

}
