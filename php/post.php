<?php
session_start();

// get XPath from ajax
if ($_SESSION['search'] == 'basic') {
    $xpath = $_SESSION['xpath'];
} else {
    $xpath = $_POST['xp'];
    $_SESSION['xpath'] = $xpath;
}
