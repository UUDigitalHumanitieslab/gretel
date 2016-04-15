<?php
require '../config/config.php';
require "$root/helpers.php";

session_cache_limiter('private'); // avoids page reload when going back
session_start();
header('Content-Type:text/html; charset=utf-8');

$currentPage = 'ebs';
$step = 6;

$id = session_id();
$date = date('d-m-Y');
$time = time();

$continueConstraints = sessionVariablesSet(array('treebank', 'search', 'sentid', 'example', 'subtb')
    && (isset($_POST['xp']) ||  $_SESSION['xpath']));

if ($continueConstraints) {
    $treebank = $_SESSION['treebank'];
    $sm = $_SESSION['search'];
    $exid = $_SESSION['sentid'];
    $example = $_SESSION['example'];

    // get context option
    $context = ($_SESSION['ct'] == 'on') ? 1 : 0;

    $lpxml = simplexml_load_file("$tmp/$id-pt.xml");

    require "$scripts/BaseXClient.php";
    require "$scripts/TreebankSearch.php"; // functions to find treebank data in BaseX database and print them
    require "$scripts/FormatResults.php"; // functions to format the treebank results
}

require "$root/functions.php";
require "$root/php/head.php";

if ($continueConstraints) : ?><link rel="stylesheet" href="<?php echo $home; ?>/style/css/tree-visualizer.css"><?php endif; ?>
</head>

<?php
require "$root/php/header.php";

if ($continueConstraints):

    if (getenv('REMOTE_ADDR')) {
        $user = getenv('REMOTE_ADDR');
    } else {
        $user = 'anonymous';
    }

    // log files
    $oomlog = "$log/oom.log";
    $xplog = "$log/gretel-ebq.log";


    // messages and documentation
    $span = '<span id="span_ID">no sentence selected</span>';
    $export = "$home/scripts/SaveResults.php?"; // script for downloading the results
    $exportxp = "$home/scripts/SaveXPath.php"; // script for downloading the XPath expression
    $showtree = "$home/scripts/ShowTree.php"; // script for displaying syntax trees
    $captcha = "This is a suspicious input example. GrETEL does not accept URL's or HTML as input.";
    /***********************************************************/
    /* INCLUDE SCRIPTS */



    /***********************************************************/

    try {
        $start = microtime(true);
        // get XPath
        if ($sm == 'basic') {
            $xpath = $_SESSION['xpath'];
        } else {
            $xpath = $_POST['xp'];
            $_SESSION['xpath'] = $xpath;
        }

        $xpath = rtrim($xpath);
        $xpath = preg_replace('/[\\n\\r]+/', ' ', $xpath); // remove newlines and tabs
        $trans = array("='" => '="', "'\s" => '"\s', "']" => '"]'); // deal with quotes/apos
        $xpath = strtr("$xpath", $trans);

        if (preg_match('/(http:\/\/.*)|(<\W+>)/', $xpath) == 1) { // check for spam
            echo '<h3>Error</h3>';
            echo $captcha."\n<br/><br/>";
            exit;
        }

        // log XPath
        $xplog = fopen($xplog, 'a'); //concatenate
        fwrite($xplog, "$date\t$user\t$id-$time\t$sm\t$treebank\tUSERXP\t$xpath\n");
        fclose($xplog);

        if (is_array($_SESSION['subtb'])) {
            $subtreebanks = array_keys($_SESSION['subtb']);
            $subtb = implode('-', $subtreebanks);
            $components = implode(', ', $subtreebanks); // get string of components
            $export .= 'subtb='.$subtb;
        } else {
            $subtb = $_SESSION['subtb'];
        }

        /* FOR SMALL TREEBANKS */
        if ($treebank == 'lassy' || $treebank == 'cgn') {

            // create session
            $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

            // get results
            try {
                // get counts
                list($HITS, $MS, $TOTALS, $TOTALCOUNTS) = GetCounts($xpath, $treebank, $subtreebanks, $session);

                // get sentences
                if ($TOTALCOUNTS['hits'] > 20000 || $TOTALCOUNTS['ms'] > 5000) { // display subset if too many hits
                    $limit = 500;
                    list($sentences, $counthits, $idlist, $beginlist) = GetSentences($xpath, $treebank, $subtreebanks, $session, $limit, $context);
                } elseif ($TOTALCOUNTS['hits'] != 0) {
                    list($sentences, $counthits, $idlist, $beginlist) = GetSentences($xpath, $treebank, $subtreebanks, $session, 'none', $context);
                }

                // print query
                echo '<div><button type="button" value="Printer-friendly version" ' .
                    'onclick="window.open(\''.$export.'&print=html\')">Printer-friendly version</button></div>';

                echo '<h3>Query</h3>' .
                    '<p>You can <a href="'.$exportxp.'" title="XPath query">save the XPath query</a> to use it as input for the XPath search mode. This allows you to use the ' .
                    'same query for another (part of a) treebank or for a slightly modified search without having to start completely ' .
                    'from scratch.</p>' .
                    '<table><tbody>' .
                    '<tr><th>Input example</th><td>'.$example.'</td></tr>' .
                    '<tr><th>XPath</th><td>'.$xpath.'</td></tr>' .
                    '<tr><th>Treebank</th><td>'.strtoupper($treebank).' ['.$components.']</td>' .
                    '</tr></tbody></table>';

                if ($TOTALCOUNTS['hits'] == 0) {
                    echo "<strong>Results: </strong> ";
                } else {
                  // format counts
                  list($HITS) = NumFormatHash($HITS);
                  list($MS) = NumFormatHash($MS);
                  list($TOTALS) = NumFormatHash($TOTALS);
                  list($TOTALCOUNTS) = NumFormatHash($TOTALCOUNTS);

                  echo '<h3>Results</h3>'.
                  '<p>It is possible to dowload a tab-separated file of sentence IDs, matching sentences, and hits per sentence from the table below. '.
                  'You can also see and download a distribution overview of the hits over the different treebanks.</p>' .
                  '<table><tbody>'.
                  '<tr><th>Hits</th><td>'.$TOTALCOUNTS['hits'].'</td><td><a href="#restable" class="show_hide" id="restable">'.
                  '<div id="show" class="showhide">Show hits distribution</div><div id="hide" class="showhide">Hide hits distribution</div></a></td></tr>'.
                  '<tr><th>Matching sentences</th><td>'.$TOTALCOUNTS['ms'].'</td><td><button  onclick="window.open(\''.$export.'&print=txt\')" >Download</button>'.
                  '</td>'.
                  '<tr><th>Sentences in treebank</th><td>'.$TOTALCOUNTS['totals'].'</td><td></td></tr></tbody></table>';

                  echo '<div class="slidingDiv">';  // show/hide div pt 1
                  printCounts($treebank, $HITS, $MS, $TOTALS, $TOTALCOUNTS); // print table hit distribution
                  echo '<button onclick="window.open(\''.$export.'&print=csv\')" title="Comma-separated file of detailed search results'.
                  ' (counts per treebank)">Download table</button>';
                  echo '</div>'; // show/hide div pt 2

                  if (isset($limit)) {
                      echo "<p>Since there are too many results to display, a sample of $limit hits per treebank component is presented.</p>";
                      $export .= '&limit='.$limit;
                  }

                  echo '<p><strong>Click on a sentence ID</strong> to view the tree structure. The sentence ID refers to the treebank '.
                  'component in which the sentence occurs, the text number, and the location within the text (page + sentence number).</p>';

                  printMatches($sentences, $counthits, $idlist, $beginlist, $treebank, $showtree); // print matching sentence and hits per sentence
              }
            $session->close();
          } catch (Exception $e) {
              // print $e->getMessage();
              $error = $e->getMessage();

              if (preg_match('/\[XPST0003\]/', $error)) {
                  echo 'XPATH ERROR<br/>';
                  echo "$error<br/><br/>";
              } elseif (preg_match('/\[XPTY0004\]/', $error)) {
                  echo 'OUT OF MEMORY<br/>';
                  echo $back;
                  $oom = fopen($oomlog, 'a');
                  fwrite($oom, "$date\t$user\t$id-$time\t$xpath\t$error\n");
                  fclose($oom);
              } else {
                  echo 'ERROR<br/>';
                  echo "$error<br/>";
                  echo $back;
              }
          }
      }
      /* FOR SONAR */
      elseif ($treebank == 'sonar') {
          $subtreebank = $_SESSION['subtb'];

          // print query
          echo '<table><tr><th colspan="2">QUERY</th></tr>'.
          '<tr><th>Input example</th><td>'.$example.'<td/></tr>'.
          '<tr><th>XPath</th><td>'.$xpath.' <button type="button" '.
          'value="Download XPath" onclick="window.open(\''.$exportxp.'\')">Download XPath</button> ' .
          '<!-- [<a href="'.$exportxp.'">Download XPath</a>]--> <a href="#" class="clickMe" tooltip="You can save the query '.
          'to use it as input for the XPath search mode. This allows you to use the same query for another (part of a) treebank '.
          'or for a slightly modified search without having to start completely from scratch."><sup>[?]</sup></a></td></tr>'.
          '<tr><th>Treebank</th><td>'.strtoupper($treebank).' ['.$subtreebank.']</td></tr></table>';

          try {
              $xpath = preg_replace("/^\//", '', $xpath); // remove first slash
              // XPath2BreathFirst
              $bf = `perl $scripts/Alpino2BF.pl "$tmp/$id-sub-style.xml"`;
              $basexdb = $subtreebank.$bf;

              flush();
              ob_flush();

              // Query SoNaR
              $limit = 100;
              $endtime = microtime(true) + $limit;
              $cmd = "perl $scripts/QuerySonar.pl '".$xpath."' $basexdb";

              $pipes = array();
              $descriptorspec = array(
                  0 => array('pipe', 'r'), // stdin is a pipe that the child will read from
                  1 => array('pipe', 'w'), // stdout is a pipe that the child will write to
                  2 => array('pipe', 'w'), // stderr is a file to write to
              );

              $process = proc_open($cmd, $descriptorspec, $pipes) or die("Can't open process $cmd!");

              echo '<p><strong>Results</strong></p>';
              echo '<p id="prog"><strong>Search status: </strong>Processing...    <button type="button" ' .
              'onclick="window.stop();">Stop searching</button></p>';
              echo '<p id="hits"><strong>Hits: </strong>Still counting...</p>';
              echo '<p id="sample"></p>';
              echo '<p><strong>Click on a sentence ID</strong> to view the tree structure. The sentence ID ' .
              'refers to the treebank component in which the sentence occurs, the text number, and the location ' .
              'within the text (page + sentence number).</p>';

              // print matching sentences sample
              echo '<div class="tableWrapper"><table id="example" class="sortable" border="1">'.
              '<thead><tr><th class="pointer">SENTENCE ID</th><th class="pointer">MATCHING SENTENCES</th>'.
              '<th class="pointer">HITS</th></tr></thead>'.
              '<tfoot><tr><th colspan="3"></th></tr></tfoot><tbody>';

              $range = range(0, 100);
              foreach ($range as $times) {
                  if (ob_get_level() == 0) {
                      ob_start();
                      flush();
                      $match = fgets($pipes[2]);
                      if (!empty($match)) {
                          $match = str_replace("\n", '', $match);
                          if (preg_match('/SAMPLE/', $match)) {
                              $sample = preg_split("/\t/", $match);
                              // end table
                              echo '</tbody></table></div>';
                              echo "<script>document.getElementById('sample').innerHTML ='The corpus sample displayed below contains ".
                              $sample[1].' hits in '.$sample[2].' matching sentences <!-- ('.$sample[3]." hit(s) per sentence on average) -->';</script>";
                          } else {
                              $match = preg_split("/\t/", $match);
                              $sid = $match[0];
                              $matchsent = $match[1];
                              $counthits = $match[2];
                              $db = $match[3];
                              $idlist = $match[4];
                              $beginlist = $match[5];

                              $hlsentence = HighlightSentence($matchsent, $beginlist);
                              $sentenceidlink = '<a class="match" href="'.$showtree.'?sid='.$sid.'&tb='.$treebank.'&db='.$db.'&id='.$idlist.'&opt=tv-xml" target="_blank" >'.$sid.'</a>';
                              echo '<tr><td>'.$sentenceidlink.'</td><td>'.$hlsentence.'</td><td>'.$counthits."</td></tr>";
                          }
                      } else {
                          echo '</tbody></table></div>';
                      }
                  }
                  ob_flush();
                  flush();
                  ob_end_flush();
              }

              // print number of hits
              do {
                  $t = microtime(true);
                  if (ob_get_level() == 0) {
                      ob_start();
                  }

                  if (($output = fgets($pipes[1])) != false) {
                      $output = str_replace("\n", '', $output);
                      ob_flush();
                      flush();

                      if ($t < $endtime && $output != '__END__') {
                          ob_flush();
                          flush();
                          echo "<script>document.getElementById('hits').innerHTML ='<strong>Hits: </strong>".$output."';</script>";
                          ob_flush();
                          flush();
                          ob_end_flush();
                      } elseif ($t > $endtime && $output != '__END__') {
                          echo "<script>document.getElementById('prog').innerHTML ='<strong>Search status: </strong>processing stopped';</script>";
                          ob_flush();
                          flush();
                          ob_end_flush();

                          echo "<script>document.getElementById('hits').innerHTML ='<strong>Hits: </strong>".$output." counted so far';</script>";

                          fclose($pipes[0]);
                          fclose($pipes[1]);
                          fclose($pipes[2]);
                          proc_terminate($process); // terminate the process and continue with other tasks
                          session_write_close();
                      } elseif ($output == '__END__') {
                          echo "<script>document.getElementById('prog').innerHTML ='<strong>Search status: </strong>finished!';</script>";
                          ob_flush();
                          flush();
                          break; // exit do-while loop before end time
                      } else {
                          echo "<script>document.getElementById('prog').innerHTML ='ERROR';</script>";
                          echo "TIME: $t<br/>";
                          ob_flush();
                          flush();
                      }
                  }
              } while ($t <= $endtime);
              proc_close($process);
          } catch (Exception $e) {
              // print $e->getMessage();
              $error = $e->getMessage();
              if (preg_match('/\[XPST0003\]/', $error)) {
                  echo 'XPATH ERROR<br/>';
                  echo "$error<br/><br/>";
                  echo $back;
              } elseif (preg_match('/\[XPTY0004\]/', $error)) {
                  echo 'OUT OF MEMORY<br/>';
                  echo $back;

                  $oom = fopen($oomlog, 'a');
                  fwrite($oom, "$date\t$user\t$id-$time\t$xpath\t$error\n");
                  fclose($oom);
              } else {
                  echo 'ERROR<br/>';
                  echo "$error<br/>";
              }
          }
      } else {
          setErrorHeading();
          echo 'An unknown treebank was selected.<br/>';
      }
    } catch (Exception $e) {
        // print exception
        echo $e->getMessage();
    }
    setContinueNavigation();
else: // $continueConstraints
    setErrorHeading();
    ?>
    <p>You did not select a treebank, or something went wrong when determining the XPath for your request. It is also
        possible that you came to this page directly without first entering an input example.</p>
    <?php
    getPreviousPageMessage(4);

endif;
require "$root/php/footer.php";
include "$root/scripts/AnalyticsTracking.php";

if ($continueConstraints) :
?>
    <div class="loading-wrapper">
        <div class="loading"><p>Loading tree...<br>Please wait</p></div>
    </div>
    <script src="<?php echo $home; ?>/js/jquery.dataTables.js"></script>
    <script src="<?php echo $home; ?>/js/sorttable.js"></script>
    <script src="<?php echo $home; ?>/js/tree-visualizer.js"></script>

    <script>
    $(document).ready(function () {
        // Specific implementation of the Tree Visualizer plugin for GrETEL:
        // allows refreshing of page, opening tree in new window and so on
    	var tvLink = $("a.match");

        tvLink.each(function(index) {
            $(this).attr("data-tv-url", $(this).attr("href"));
            $(this).attr("href", "#tv-" + (index + 1));
        });
        tvLink.click(function(e) {
            var $this = $(this);
            $(".loading-wrapper").addClass("active");
            window.history.replaceState("", document.title, window.location.pathname + window.location.search + $this.attr("href"));
            $("body").treeVisualizer($this.data("tv-url"), {
                normalView: false,
                initFSOnClick: true
            });
            e.preventDefault();
        });
        var hash = window.location.hash;
        if (hash) {
            if (hash.indexOf("tv-") == 1) {
                var index = hash.match(/\d+$/);
                tvLink.eq(index[0] - 1).click();
            }
        }
    	// Initialisation code dataTables
    	$('#example').dataTable({
    	    "sScrollY": "400px",
    	    "bPaginate": false
    	});

    	// Show and hide required elements
    	$(".slidingDiv").hide();
    	$(".show_hide").show();
    	$("#hide").hide(); // hide message 'hide'
    	$("#show").show(); // show message 'show'

    	$('.show_hide').click(function () {
    	    $(".slidingDiv").slideToggle();
    	    $("#show").toggle();
    	    $("#hide").toggle();
    	});
    });
    </script>
<?php endif; ?>
</body>
</html>
