<?php
  // Returns true if we're on an ebs or xps page
  $is_search = (isset($currentPage) && ($currentPage == "ebs" || $currentPage=="xps")) ? 1 : 0;

  // Returns true if we're on a page with step > 1
  $is_bigstep  = (isset($step) && $step > 1) ? 1 : 0;

  // Set page heading and subheading variables
    if (isset($currentPage)) {
        if ($currentPage == "home") $pageTitle = "What is GrETEL?";
        elseif ($currentPage == "ebs") {
            $pageTitle = "Example-based search";
            if (isset($step)) {
                $searchStepTitles = array(
                    "Give an input example",
                    "Input parse",
                    "Select relevant parts",
                    "Select a treebank",
                    "Query overview",
                    "Results"
                );
            }
        }
        elseif ($currentPage == "xps") {
            $pageTitle = "XPath search";
            if (isset($step)) {
                $searchStepTitles = array(
                    "Give an XPath expression",
                    "Select a treebank",
                    "Results"
                );
            }
        }
        elseif ($currentPage == "docs") $pageTitle = "Documentation";
    }

    // Set page heading variables
    function setPageTitle() {
      global $currentPage;
      if (isset($currentPage)) {
          if ($currentPage == "ebs" || $currentPage == "xps") {
              if ($currentPage == "ebs") {
                $pageTitle = "Example-based search";
              }
              else {
                  $pageTitle = "XPath search";
              }
              if (isset($step)) {
                $pageTitle .= " | Step $step";
              }
              $pageTitle .= ' | GrETEL';
          }
          elseif ($currentPage == "docs") {$pageTitle = "Documentation | GrETEL";}
          else {$pageTitle = "GrETEL | An example based search engine for corpora";}
      }
      else {
          $pageTitle = "GrETEL | An example based search engine for corpora";
      }
      echo $pageTitle;
  }

  function setBodyClasses() {
    global $currentPage;
    global $step;
    if (isset($currentPage)) {
      $class = 'class="';
      $class .= $currentPage;
      if ($currentPage == "ebs" || $currentPage == "xps") {
        if (isset($step)) {
          $class .= " step-$step";
        }
      }
      $class .= '"';
    }
    else $class = "";
    echo $class;
  }

  function setProgressClasses($index) {
      global $step;
      if ($step == $index) echo 'class="active"';
      elseif ($step > $index) echo 'class="done"';
  }

  function checkInputAndLog() {
    $error_flag = 1;
    global $input, $log, $date, $user, $id, $time, $sm, $home;

    $mode = preg_match("/([^\\/]+)\\/input\\.php\\/?$/", $_SERVER['REQUEST_URI']);
    if ($mode == "ebs") {
      $back = "<a href='$home/ebs/input.php'>Go to the input page.</a>";
    }
    elseif  ($mode == "xps") {
        $back = "<a href='$home/xps/input.php'>Go to the input page.</a>";
    }
    else {
        $back = "<a href='$home'>Go to the home page!</a>";
    }

    if (preg_match('/(http:\/\/.*)|(<.*)|(.*>)/', $input)==1) {
      echo "<p style='font-size: 18px;color:#DF5F5F'><strong>Error!</strong></p>";
      echo "<p>This is a suspicious input example; GrETEL does not accept URLs or HTML as input.</p>";
      echo "<p>$back</p>";
    }
    elseif(!$input || empty($input)) {
      echo "<p style='font-size: 18px;color:#DF5F5F'><strong>Error!</strong></p>";
      echo "<p>Your input was empty. Please provide an input example.</p>";
      echo "<p>$back</p>";
    }

    else {
      $log = fopen("$log/gretel-ebq.log", "a");  //concatenate sentences
      fwrite($log, "$date\t$user\t$id-$time\t$sm\t$input\n");
      fclose($log);
      $_SESSION['sentid']="$id-$time";
      $_SESSION['example']=$input;
      $error_flag = 0;
    }
    return $error_flag;
  }

?>
