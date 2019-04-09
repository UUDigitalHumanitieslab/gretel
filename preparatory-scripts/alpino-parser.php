<?php
/**
 * version 0.3 date: 14.10.2014  RELEASED WITH GrETEL2.0
 * written by Liesbeth Augustinus (c) 2014
 * for the GrETEL2.0 project.
 */

/**
 * @return string the sentence as parsed by alpino
 *
 * @throws Exception when Alpino cannot be contacted or fails to return in a timely manner
 */
function alpino_server($sentence)
{
    global $alpinoServerAddress;
    global $alpinoServerPort;
    $xml = "";

    $fs = fsockopen($alpinoServerAddress, $alpinoServerPort, $errno, $errstr);
    if (!$fs) {
        throw new Exception("Error contacting alpino at $alpinoServerAddress");
    }
    fwrite($fs, $sentence."\n\n");

    while (!feof($fs) && ($part = fread($fs, 8096))) {
        $xml .= $part;
    }
    fclose($fs);

    if (!$xml) {
        throw new Exception('Error parsing sentence with Alpino.');
    }

    return $xml;
}

/**
 * @return string the sentence as parsed by alpino
 *
 * @throws Exception when Alpino cannot be started/contacted or fails to return in a timely manner
 */
function alpino($sentence, $id)
{
    global $alpinoDirectory;
    global $alpinoServerMode;
    if ($alpinoServerMode) {
        return alpino_server($sentence);
    }

    $descriptorspec = array(
              0 => array('pipe', 'r'),  // stdin is a pipe that the child will read from
              1 => array('pipe', 'w'),  // stdout is a pipe that the child will write to
              2 => array('file', ROOT_PATH.'/log/alpino.log', 'a'), // stderr is a file to write to
              );

    $cwd = '/';
    $env = array('ALPINO_HOME' => $alpinoDirectory);
    $tmp = ROOT_PATH.'/tmp';
    $alpino = "$alpinoDirectory/bin/Alpino -notk -veryfast max_sentence_length=20 user_max=180000 -end_hook=xml -flag treebank $tmp -parse";
    $process = proc_open($alpino, $descriptorspec, $pipes, $cwd, $env);

    if (!is_resource($process)) {
        // die('Error when parsing input with Alpino');
        throw new Exception('Error starting Alpino.');
    }

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
    if ($return_value != 0) {
        throw new Exception('Error parsing sentence with Alpino');
    }

    //    echo "command returned $return_value\n";
    $location = ROOT_PATH."/tmp/$id.xml";
    $parsed = fopen($location, 'r');
    if (!$parsed) {
        throw new Exception('Unable to open Alpino output');
    }

    $xml = fread($parsed, filesize($location));
    fclose($parsed);
    unlink($location);

    return $xml;
}
