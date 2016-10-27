<?php

function checkCorpusAvailability($corpusArray) {
  global $databaseGroups, $dbuser, $dbpwd;
  $availabilityArray = array();

  foreach ($databaseGroups as $corpus => $corpusInfo) {
    // Only query for corpora we actually need
    if (!in_array($corpus, $corpusArray)) {
      continue;
    }
    if ($corpus == 'sonar') {
      $components = array_keys($databaseGroups{$corpus});
      // Remove REST
      unset($components[0]);
      $components = array_merge($components, $corpusInfo{'REST'}{'components'});
      foreach ($components as $component) {
        $serverInfo = getServerInfo($corpus, $component);
        $dbhost = $serverInfo{'machine'};
        $dbport = $serverInfo{'port'};
        try {
          // When a connection to the BaseX server cannot be made, there will be
          // a PHP socket() error. We do not need to log this, as it is expected
          // behaviour
          $previousReportingLevel = error_reporting(0);
          $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);
          error_reporting($previousReportingLevel);

          // Let's assume that a corpus is available if its sentence2treebank is
          $databaseName = strtoupper($component).'sentence2treebank';
          // db:exists returns a string 'false', still need to convert to bool
          $corpusExists = toBoolean($session->query("db:exists('$databaseName')")->execute());

          $session->close();

          if ($corpusExists) {
            $availabilityArray{$corpus}[] = $component;
          }
        } catch (Exception $e) {
          // error_log("$e for component $component");
        }
      }
    } else {
      $serverInfo = getServerInfo($corpus, false);
      $dbhost = $serverInfo{'machine'};
      $dbport = $serverInfo{'port'};
      try {
        $session = new Session($dbhost, $dbport, $dbuser, $dbpwd);

        foreach ($serverInfo{'components'} as $component) {
          $databaseName = strtoupper($corpus) . '_ID_' . strtoupper($component);
          // db:exists returns a string 'false', still need to convert to bool
          $corpusExists = toBoolean($session->query("db:exists('$databaseName')")->execute());

          if ($corpusExists) {
            $availabilityArray{$corpus}[] = $component;
          }
        }
        $session->close();
      } catch (Exception $e) {
        // error_log("$e for corpus $corpus");
      }
    }
  }

  return $availabilityArray;
}

function toBoolean($string) {
  if ($string == 'false') {
    return false;
  }
  return true;
}

function printAvailablityComponent($corpus, $component, $checked, $disabled) {
  global $treebankAvailableArray;

  $checkedString = $checked ? 'checked' : '';

  if ($corpus == 'sonar') {
    $letters = str_split($component);
    $lessLetters = array_slice($letters, 1, 4);
    $componentString = $letters[0] . implode('-', $lessLetters);
    $inputType = 'radio';
  } else {
    $componentString = $component;
    $inputType = 'checkbox';
  }
  if (in_array($component, $treebankAvailableArray{$corpus}) && !$disabled) {
    $html = '<td><label><input type="'.$inputType.'" data-treebank="'.$corpus.'" name="subtreebank[]" value="'.$component.'" '.$checkedString.'>';
    $html .= ' ' . $componentString . '</label></td>';
  } else {
    $html = '<td><label class="disabled"><input type="'.$inputType.'" data-treebank="'.$corpus.'" name="subtreebank[]" value="'.$component.'" disabled '.$checkedString.'>';
    $html .= ' ' . $componentString . '</label>';
    if ($disabled) {
      $html .= '</td>';
    } else {
      $html .= '<div class="help-tooltip hang-right" role="tooltip" data-title="This component is currently not available">'
        . '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>'
        . '<span class="sr-only">This component is currently not available</span></div>';

      $html .= '</td>';
    }
  }

  echo $html;
}
