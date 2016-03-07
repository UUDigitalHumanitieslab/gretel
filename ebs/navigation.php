<script>
function goBack() {
    window.history.back()
}


$(document).ready(function() {
    if($(window).width() < 1100 && $(window).width() >= 700 )
{
  $(".breadcrumb").css('display', 'none'); //add or unhide image.
  $(".ellipse").css('display', 'block');
  $(".circular").css('display', 'none');
} 

else if ($(window).width() < 700 ) 
{

$(".breadcrumb").css('display', 'none'); //add or unhide image.
  $(".ellipse").css('display', 'none');
  $(".circular").css('display', 'block');

}

else
{
  $(".breadcrumb").css('display', 'block'); //add or unhide image.
  $(".ellipse").css('display', 'none');	
  $(".circular").css('display', 'none');
} 
});
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

<td align="left">
<ul style="list-style:none" class="ellipse" id="'.$step.'">
 <li><p>1 - Example</p></li>
  <li><p>2 - Parse</p></li>
  <li><p>3 - Matrix</p></li>
  <li><p>4 - Treebank</p></li>
  <li><p>5 - Query</p></li>
  <li><p>6 - Results</p></li>
</ul>
</td>

<td align="left">
<ul style="list-style:none" class="circular" id="'.$step.'">
  <li><p>1</p></li>
  <li><p>2</p></li>
  <li><p>3</p></li>
  <li><p>4</p></li>
  <li><p>5</p></li>
  <li><p>6</p></li>
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
