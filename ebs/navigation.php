<script>
function goBack() {
    window.history.back()
}

$(document).ready(function() {
    function navResize() {
        if($(window).width() < 1300 && $(window).width() > 960 ) {
            $("nav ul").addClass('ellipse').removeClass('circular breadcrumb');
        }
        else if ($(window).width() <= 960 ) {
            $("nav ul").addClass('circular').removeClass('ellipse breadcrumb');
        }
        else {$("nav ul").addClass('breadcrumb').removeClass('ellipse circular');}
    }
    $(window).resize(navResize);
    navResize();

    $(".progressbar li:nth-child(<?php echo $step;?>)").addClass("active");
});
</script>
<?php
echo'
<nav>
<ul class="breadcrumb progressbar">
  <li><p>1<span> - Example</span></p></li>
  <li><p>2<span> - Parse</span></p></li>
  <li><p>3<span> - Matrix</span></p></li>
  <li><p>4<span> - Treebank</span></p></li>
  <li><p>5<span> - Query</span></p></li>
  <li><p>6<span> - Results</span></p></li>
</ul>
<div id="ccl-logo">';

if ($step==1) {
  echo '<p><b>GrETEL 2.0</b></p>';
}
else {
  echo '<p><b>GrETEL 2.0</b> - '.$sm.' search mode</p>';
}
echo'
<input type="button" value="Home" onclick="location.href = \'../index.php\'"/>
<a href="http://ccl.kuleuven.be" target="_blank"><img src="../img/ccl-logo-square.png" height="50"></img></a>
</div>
</nav>
';
?>
