<?php

session_start();
$xpath = $_SESSION['xpath'];
session_write_close();

header('Content-type:text/plain; charset=utf-8');

echo "$xpath\n";
