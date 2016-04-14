<?php

function sessionVariablesSet($array)
{
    foreach ($array as $entry) {
        if (!isset($_SESSION[$entry])) {
            return false;
        }
    }

    return true;
}

function postVariablesSet($array)
{
    foreach ($array as $entry) {
        if (!isset($_POST[$entry])) {
            return false;
        }
    }

    return true;
}
