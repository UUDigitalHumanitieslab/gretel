<?php

  function isGrinded($corpus)
  {
      global $databaseGroups;

      if (array_key_exists($corpus, $databaseGroups) &&
          array_key_exists('grinded', $databaseGroups[$corpus])) {
          return $databaseGroups[$corpus]['grinded'];
      }

      return false;
  }

  // Returns associative array containing at least the machine and the port
  function getServerInfo($corpus, $grindedComponent)
  {
      global $databaseGroups;

      if (array_key_exists($corpus, $databaseGroups)) {
          // Corpus specified in the configuration
          if (!$grindedComponent) {
              return $databaseGroups[$corpus];
          }
          // Grinded components
          elseif (array_key_exists($grindedComponent, $databaseGroups[$corpus])) {
              return $databaseGroups[$corpus][$grindedComponent];
          } elseif (in_array($grindedComponent, $databaseGroups[$corpus]['REST']['components'])) {
              return $databaseGroups[$corpus]['REST'];
          } else {
              throw new Exception(`No database specified for component $grindedComponent in corpus $corpus`);
          }
      } elseif (API_URL) {
          // Retrieval from API: one servername/port
          return $databaseGroups['api'];
      }

      throw new Exception(`No database specified for $corpus`);
  }

  // Remove false-y items and spaces-only items from array
  function array_cleaner($array)
  {
      $array = array_map('trim', $array);
      $array = array_filter($array);

      return $array;
  }
