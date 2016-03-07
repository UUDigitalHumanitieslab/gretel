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
  <li><p>1 - XPath</p></li>
  <li><p>2 - Treebanks</p></li>
  <li><p>3 - Results</p></li>
</ul>
</td>
';

echo '
<td align="right"><p><b>GrETEL 2.0</b> - XPath search mode</p></td>
';

echo '<td align="right">';

echo 
'<input type="button" value="Home" onclick="location.href = \'../index.php\'"/>'
;

echo '</td>
</tr>
</table>
';
?>
