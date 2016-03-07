<script>
function goBack() {
    window.history.back()
}
</script>
<?php
echo'
<table class="navigation">
<tr>
<td align="left">
<ul style="list-style:none" class="breadcrumb" id="'.$step.'">
  <li><p>1 - Example</p></li>
  <li><p>2 - Parse</p></li>
  <li><p>3 - Matrix</p></li>
  <li><p>4 - Treebank</p></li>
  <li><p>5 - Query</p></li>
  <li><p>6 - Results</p></li>
</ul>
</td>
';
if ($step=="step_one") {
  echo '<td align="right"><b>GrETEL 2.0</b></td>';
}
else {
  echo '
<td align="right"><p><b>GrETEL 2.0</b> - '.$sm.' search mode</p></td>
';
}

echo '<td align="right">';

echo 
'<input type="button" value="Home" onclick="location.href = \'../index.php\'"/>'
;

echo '</td>
</tr>
</table>
';
?>
