<?php
  // Returns true if we're on an ebs or xps page
  $is_search = (isset($currentPage) && ($currentPage == 'ebs' || $currentPage == 'xps')) ? 1 : 0;

  // Returns true if we're on a page with step > 1
  $is_bigstep = (isset($step) && $step > 1) ? 1 : 0;

  function setErrorHeading($string = '')
  {
      $message = 'Error';
      if ($string != '') {
          $message .= ": $string";
      }
      $message .= '!';
      echo "<h3 class='error-heading'>$message</h3>";
  }

  function getPreviousPageMessage($goToStep)
  {
      global $home, $currentPage, $ebsPages, $xpsPages;
      $message = '<p>You can ';
      if (isset($currentPage)) {
          $keys = array_keys(${$currentPage.'Pages'});
          $href = $home.'/'.$currentPage.'/'. $keys[$goToStep - 1];

          $message .= "go to <a href='$href' title='Previous page'>step $goToStep</a> or ";
      }
      $message .= "go directly to <a href='$home' title='Go to the homepage'>to the homepage</a>.</p>";
      echo $message;
  }

  // Set page heading and subheading variables
  if (isset($currentPage)) {
      if ($currentPage == 'home') {
          $pageHeading = 'What is GrETEL?';
      } elseif ($currentPage == 'ebs') {
          $pageHeading = 'Example-based search';
          if (isset($step)) {
              $searchStepHeadings = array(
                  'Give an input example',
                  'Input parse',
                  'Select relevant parts',
                  'Select a treebank',
                  'Query overview',
                  'Results',
              );
          }
      } elseif ($currentPage == 'xps') {
          $pageHeading = 'XPath search';
          if (isset($step)) {
              $searchStepHeadings = array(
                  'Give an XPath expression',
                  'Select a treebank',
                  'Results',
              );
          }
      } elseif ($currentPage == 'docs') {
          $pageHeading = 'Documentation';
      }
  }

    // Set page heading variables
    function setPageTitle()
    {
        global $currentPage, $step;
        if (isset($currentPage)) {
            if ($currentPage == 'home') {
                $pageTitle = 'GrETEL | An example based search engine for corpora';
            } else {
                if ($currentPage == 'ebs' || $currentPage == 'xps') {
                    if ($currentPage == 'ebs') {
                        $pageTitle = 'Example-based search';
                    } else {
                        $pageTitle = 'XPath search';
                    }
                    if (isset($step)) {
                        $pageTitle .= " | Step $step";
                    }
                } elseif ($currentPage == 'docs') {
                    $pageTitle = 'Documentation';
                }
                $pageTitle .= ' | GrETEL';
            }
        } else {
            $pageTitle = 'GrETEL | An example based search engine for corpora';
        }
        echo $pageTitle;
    }

  function setBodyClasses()
  {
      global $currentPage, $step;
      if (isset($currentPage)) {
          $class = 'class="';
          $class .= $currentPage;
          if ($currentPage == 'ebs' || $currentPage == 'xps') {
              if (isset($step)) {
                  $class .= " step-$step";
              }
          }
          $class .= '"';
      } else {
          $class = '';
      }
      echo $class;
  }

  function setProgressClasses($index)
  {
      global $step;
      if ($step == $index) {
          return 'class="active no-hover"';
      } elseif ($step > $index) {
          return 'class="done"';
      } else {
          return 'class="no-hover"';
      }
  }

  function setProgressGoBack($index) {
      global $step;

      if ($index < $step) {
          $diff = $index - $step;
          return 'onclick="history.go('.$diff.'); return false"';
      }
  }

  function buildProgressList()
  {
      global $step, $home, $ebsPages, $xpsPages, $currentPage;
      $i = 0;

      $output = '<ul class="progressbar">';
      if ($currentPage == 'ebs'):
          foreach ($ebsPages as $uri => $title) {
              ++$i;
              $class = setProgressClasses($i);
              $onclick = setProgressGoBack($i);
              $output .= '<li '.$class.'><a href="'.$home.'/ebs/'.$uri.'" '.$onclick.'>'.$i.
                '<span> - '.$title.'</span></a></li>';
          }
      else:
          foreach ($xpsPages as $uri => $title) {
              ++$i;
              $class = setProgressClasses($i);
              $onclick = setProgressGoBack($i);
              $output .= '<li '.$class.'><a href="'.$home.'/xps/'.$uri.'" '.$onclick.'>'.$i.
                '<span> - '.$title.'</span></a></li>';
          }
      endif;
      $output .= '</ul>';
      echo $output;
  }

  function checkInputAndLog($logflag = 0)
  {
      $error_flag = 1;
      global $input, $log, $user, $id, $sm, $home;

      $mode = preg_match('/([^\\/]+)\\/input\\.php\\/?$/', $_SERVER['REQUEST_URI']);
      if ($mode == 'ebs') {
          $back = "<a href='$home/ebs/input.php'>Go to the input page.</a>";
      } elseif ($mode == 'xps') {
          $back = "<a href='$home/xps/input.php'>Go to the input page.</a>";
      } else {
          $back = "<a href='$home'>Go to the home page!</a>";
      }

      if (preg_match('/(http:\/\/.*)|(<.*)|(.*>)/', $input) == 1) {
          echo "<p style='font-size: 18px;color:#DF5F5F'><strong>An error occurred!</strong></p>";
          echo '<p>This is a suspicious input example; GrETEL does not accept URLs or HTML as input.</p>';
          echo "<p>$back</p>";
      } elseif (!$input || empty($input)) {
          echo "<p style='font-size: 18px;color:#DF5F5F'><strong>An error occurred!</strong></p>";
          echo '<p>Your input was empty. Please provide an input example.</p>';
          echo "<p>$back</p>";
      } else {
          if (!$logflag) {
              $date = date('d-m-Y');
              $time = time();
              $user = (getenv('REMOTE_ADDR')) ? getenv('REMOTE_ADDR') : 'anonymous';

              $log = fopen("$log/gretel-ebq.log", 'a');  //concatenate sentences
        fwrite($log, "$date\t$user\t$id-$time\t$sm\t$input\n");
              fclose($log);
          }
          $error_flag = 0;
      }

      return $error_flag;
  }

  function buildEbsMatrix()
  {
      global $sentence, $sm,$matrixOptions;

      $tableHTML = '<table><thead><tr><th>sentence</th>';

      foreach ($sentence as $key => $word) {
          $tableHTML .= "<td>$word</td>";
      }
      $tableHTML .= '</tr></thead><tbody>';
      $i = 0;
      foreach ($matrixOptions as $array) {
          ++$i;
          foreach ($array as $th => $val) {
              if ($sm == 'basic' && $i == 2) {
                  break;
              }
              if ($i >= 2) {
                  $tableHTML .= '<tr class="advanced">';
              } else {
                  $tableHTML .= '<tr>';
              }

              $tableHTML .= "<th>$th</th>";
              foreach ($sentence as $key => $word) {
                  $is_puc = preg_match("/[\.\,\?\!\:\]\[\(\)\-]/", $word);
                  $word = htmlspecialchars($word, ENT_QUOTES);
                  if (($val == 'pos' & !$is_puc) || $val == 'na' && $is_puc) {
                      $tableHTML .= "<td><input type='radio' name='$word--$key' value='$val' checked></td>";
                  } else {
                      $tableHTML .= "<td><input type='radio' name='$word--$key' value='$val'></td>";
                  }
              }
              $tableHTML .= '</tr>';
          }
      }
      $tableHTML .= '</tbody></table>';

      echo $tableHTML;
  }

  function setContinueNavigation()
  {
      global $step, $currentPage, $ebsPages, $xpsPages, $is_bigstep;
      echo '<nav class="continue-btn-wrapper">';
      if ($is_bigstep) {
          echo '<button onclick="history.go(-1); return false"><i>&larr;</i> Go back</button>';
      }
      if (isset($currentPage, $step) && $step < count(${$currentPage.'Pages'})) {
          echo '<button type="submit">Continue <i>&rarr;</i></button>';
      }
      echo '</nav>';
  }
