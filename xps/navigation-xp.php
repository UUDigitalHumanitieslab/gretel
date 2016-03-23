<script>
function goBack() {
    window.history.back()
}

$(document).ready(function() {
    $(".progressbar li:nth-child(<?php echo $step;?>)").addClass("active");
});
</script>
<?php
echo'
<nav>
<ul style="list-style:none" class="breadcrumb progressbar" id="'.$step.'">
  <li><p>1<span> - XPath</span></p></li>
  <li><p>2<span> - Treebanks</span></p></li>
  <li><p>3<span> - Results</span></p></li>
</ul>
<div id="ccl-logo">
<p><b>GrETEL 2.0</b> - XPath search mode</p>
<input type="button" value="Home" onclick="location.href = \'../index.php\'"/>
<a href="http://ccl.kuleuven.be" target="_blank"><img src="../img/ccl-logo-square.png" height="50"></img></a>
</div>
</nav>
';
?>
