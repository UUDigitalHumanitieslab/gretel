<?php

if (strpos($_SERVER['REQUEST_URI'], '/ng') === false) {
    header('Location: ng/', true, 302);
    exit();
}

$content = file_get_contents('ng/index.html');
// by having it all from a ng folder
$base = explode('/ng/', $_SERVER['REQUEST_URI'])[0];
if (substr($base, -1) === '/') {
    $base = substr($base, 0, -1);
}

echo str_replace('<base href="/ng/">', "<base href=\"$base/ng/\">", $content);
