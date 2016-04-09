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

?>
