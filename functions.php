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

  function setPreviousPageMessage($goToStep)
  {
      global $currentPage, $ebsPages, $xpsPages;
      $message = '<p>You can ';
      if (isset($currentPage)) {
          $keys = array_keys(${$currentPage.'Pages'});
          $href = $currentPage.'/'.$keys[$goToStep - 1];

          $message .= "go to <a href='$href' title='Go to a previous step'>step $goToStep</a> ";

          if ($goToStep == 1) $message .= "and try a new example ";
      }
      $message .= "or go directly to <a href='index.php' title='Go to the homepage'>the homepage</a>.</p>";
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
        $pageTitle = '';
        if (isset($currentPage)) {
            if ($currentPage == 'home') {
                $pageTitle .= 'GrETEL | An example based search engine for corpora';
            } else {
                if ($currentPage == 'ebs' || $currentPage == 'xps') {
                    if (isset($step)) {
                        $pageTitle .= "Step $step | ";
                    }
                    if ($currentPage == 'ebs') {
                        $pageTitle .= 'Example-based search | ';
                    } else {
                        $pageTitle .= 'XPath search | ';
                    }
                } elseif ($currentPage == 'docs') {
                    $pageTitle .= 'Documentation';
                }
                $pageTitle .= ' | GrETEL';
            }
        } else {
            $pageTitle .= 'GrETEL | An example based search engine for corpora';
        }
        echo $pageTitle;
    }

  function setBodyClasses()
  {
      global $currentPage, $step, $ebsPages, $xpsPages;
      if (isset($currentPage)) {
          $class = 'class="';
          $class .= $currentPage;
          if ($currentPage == 'ebs' || $currentPage == 'xps') {
              if (isset($step)) {
                  $class .= " step-$step";
              }
              $pageType = array_values(${$currentPage.'Pages'});
              $class .= ' ' . strtolower($pageType[$step-1]);
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

  function setProgressGoBack($index)
  {
      global $step;

      if ($index < $step && $index > 0) {
          $diff = $index - $step;

          return 'onclick="window.history.go('.$diff.'); return false;"';
      }
  }

  function buildProgressList()
  {
      global $step, $ebsPages, $xpsPages, $currentPage;
      $i = 0;

      $output = '<ul class="progressbar">';
      if ($currentPage == 'ebs'):
          foreach ($ebsPages as $uri => $title) {
              ++$i;
              $class = setProgressClasses($i);
              $onclick = setProgressGoBack($i);
              $output .= '<li '.$class.'><a href="ebs/'.$uri.'" '.$onclick.' title="'.$title.'">'.$i.
                '<span> - '.$title.'</span></a></li>';
          } else:
          foreach ($xpsPages as $uri => $title) {
              ++$i;
              $class = setProgressClasses($i);
              $onclick = setProgressGoBack($i);
              $output .= '<li '.$class.'><a href="xps/'.$uri.'" '.$onclick.' title="'.$title.'">'.$i.
                '<span> - '.$title.'</span></a></li>';
          }
      endif;
      $output .= '</ul>';
      echo $output;
  }

  function buildEbsMatrix()
  {
      global $sentence, $matrixOptions;

      $tableHTML = '<table><thead><tr><th>sentence</th>';

      foreach ($sentence as $key => $word) {
          $tableHTML .= "<td>$word</td>";
      }
      $tableHTML .= '</tr></thead><tbody>';

      $i = 0;
      foreach ($matrixOptions as $thValArray) {
        $i++;
          foreach ($thValArray as $th => $val) {
              $tableHTML .= "<tr class='row-group-$i'><th>$th</th>";
              foreach ($sentence as $key => $word) {
                  $isPunc = preg_match("/[\.\,\?\!\:\]\[\(\)\-]/", $word);
                  $word = htmlspecialchars($word, ENT_QUOTES);
                  if (($val == 'pos' & !$isPunc) || ($val == 'na' && $isPunc)) {
                      $tableHTML .= "<td><input type='radio' name='$word--$key' value='$val' checked></td>";
                  }
                  // Case sensitive
                  elseif ($val == 'cs') {
                    $tableHTML .= "<td class='disabled'>";
                    if (!$isPunc) {
                      $tableHTML .= "<input type='checkbox' name='$word--$key' value='$val' disabled>";
                    }
                    $tableHTML .= "</td>";
                  }
                  else {
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
          echo '<button onclick="history.go(-1); return false" title="Go back to the previous page"><i class="fa fa-fw fa-arrow-left" aria-hidden="true"></i> Go back</button>';
      }
      if (isset($currentPage, $step) && $step < count(${$currentPage.'Pages'})) {
          echo '<button type="submit" title="Continue to the next page">Continue <i class="fa fa-fw fa-arrow-right" aria-hidden="true"></i></button>';
      }
      echo '</nav>';
  }

  function xpath2Bf($xpath)
  {
      $bfresult;
      // Divide XPath in top-most level, and the rest (its "descendants")
      if (preg_match("/^\/\/?node\[([^\[]*?)((?:node\[|count\().*)\]$/", $xpath, $items)) {
          list(, $topattrs, $descendants) = $items;

          $topcat;
           // Find category of top node
           // CAVEAT: only takes one cat into account and not OR constructions
           if ($topattrs && preg_match("/\@cat=\"([^\"]+)\"/", $topattrs, $toppattrsArray)) {
               $topcat = $toppattrsArray[1];
           }
           // If the top node doesn't have any attributes
           // or if value is not specified, return ALL
           else {
               $topcat = 'ALL';
           }

           // Only continue if there is more than one level
           if ($descendants) {
               // Remove fixed-order nodes, not relevant
               $descendants = preg_replace("/(?:and)?number\(\@begin\).*?\@begin\)/", '', $descendants);

               $depth = 0;
               $children = '';
               $charlength = strlen($descendants);

               // Goes through each character of the string and keeps track of the
               // depth we're in. If the depth is two or more, we don't take those
               // characters into account. Output is $children that contains only
               // nodes from the second level (i.e. "children" of top node)
               for ($pos = 0; $pos < $charlength; ++$pos) {
                   $char = substr($descendants, $pos, 1);

                   if ($char == '[') {
                       ++$depth;
                   }

                   // If we're less than 2 levels deep: keep characters in string
                   if ($depth < 2) {
                       $children .= $char;
                   }

                   // If we're deeper: don't include string, and possibly remove
                   // trailing start node of a deeper level
                   else {
                       $children = preg_replace('/(and )?node$/', '', $children);
                   }

                 // Only decrement depth after operations to ensure closing brackets
                 // of nodes that are too deep are excluded
                   if ($char == ']') {
                       --$depth;
                   }
               }

               // At the end of the loop depth ought to be zero
               /*
               if ($depth != 0) {
                   // warn("XPath not correct");
               }
               */

              // Check if there is a count present
              // and manipulate the string accordingly, i.e. multiply when necessary
              // e.g. count(node[@pt="n"]) > 1 -> node[@pt="n"] and node[@pt="n"]
               $children = preg_replace_callback("/(count\((.*)\) *> *([1-9]+))/",
                function ($matches) {
                    return $matches[2].str_repeat(' and '.$matches[2], $matches[3]);
                }, $children);

               $dfpatterns = array();

               // Loop through all remaining node[...] matches and extract rel
               // and cat values
               preg_match_all("/node\[([^\]]*)/", $children, $childrenArray);

               foreach ($childrenArray[0] as $childNode) {
                   preg_match("/\@rel=\"([^\"]+)\"/", $childNode, $rel);
                   preg_match("/\@cat=\"([^\"]+)\"/", $childNode, $cat);

                   if (!$cat) {
                       preg_match("/\@pt=\"([^\"]+)\"/", $childNode, $cat);
                   }

                   $dfpattern;

                   // If rel exists, push value (and possibly also cat/pt) to array
                   // CAVEAT: when no rel present, the node will be left out the
                   // breadth-first pattern and therefore the pattern as a whole is
                   // incomplete, and thus not usable
                   if ($rel) {
                       $dfpattern = "$rel[1]%";
                       if ($cat[1]) {
                           $dfpattern .= $cat[1];
                       }
                       array_push($dfpatterns, $dfpattern);
                   }
               }  // end foreach

               if ($dfpatterns) {
                   // Sort array alphabetically
                   sort($dfpatterns);
                   $dfpatternjoin = implode('_', $dfpatterns);
                   $bfresult = $topcat.$dfpatternjoin;
               } else {
                   $bfresult = $topcat;
               }
           }    // end if ($descendants)
           else {
               $bfresult = $topcat;
           }
      } else {
          $bfresult = false;
      }

      return $bfresult;
  }

  function isSpam($string)
  {
    // NOTE: backslash needs to be escaped twice
    $websiteRegex = '/(?:https?\:\/\/)?[a-zA-Z0-9-.+&@#%?=~_|!:,.;\/\\\]+(?:\.[a-zA-Z]{2,3}){1,2}(\/\S*)?/';
    $emailRegex = '/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/';

    if (preg_match($websiteRegex, $string) || preg_match($emailRegex, $string)) {
      return true;
    }
    return false;
  }

  function Tokenize($sentence)
  {
    // Add space before and after punctuation marks
    $sentence = preg_replace('/([<>\.\,\:\;\?!\(\)\"])/', ' $1 ', $sentence);
    // Deal wth ...
    $sentence = preg_replace("/(\.\s+\.\s+\.)/", ' ... ', $sentence);
    // Delete first and last space(s)
    $sentence = preg_replace('/^\s*(.*?)\s*$/', '$1', $sentence);
    // Change multiple spaces to single space
    $sentence = preg_replace('/\s+/', ' ', $sentence);
    return $sentence;
  }

  function ModifyLemma($parse, $id, $tmp)
  {
      $parseloc = "$tmp/$id-pt.xml";
      $input = fopen($parse, 'r');
      $output = fopen($parseloc, 'w');
      // Read alpino parse
      $xml = simpledom_load_file($parse);
      // Sort terminal nodes by 'begin' attribute
      $pts = $xml->sortedXPath('//node[@begin and @postag]', '@begin');

      foreach ($pts as $pt) {
          if ($pt != 'let') {
              $lemma = $pt->getAttribute('lemma');
              // Remove _DIM from lemmas (for diminutives)
              $lemma = preg_replace('/_DIM/', '', $lemma);
              // Remove _ from lemmas (for compounds)
              $lemma = preg_replace('/_/', '', $lemma);
              // Add lemma
              $pt->setAttribute('lemma', $lemma);
          }
      }

      $tree = $xml->asXML();
      fwrite($output, $tree);
      fclose($output);

      return $parseloc;
  }
