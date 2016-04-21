<?php
session_start();

// get XPath from ajax
if ($_SESSION['search'] == 'advanced') {
    $_SESSION['xpath'] = $_POST['xp'];
    $_SESSION['originalXp'] = $_POST['originalXp'];
}
