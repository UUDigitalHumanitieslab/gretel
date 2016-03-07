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
  <li><p>1 - XPath</p></li>
  <li><p>2 - Treebanks</p></li>
  <li><p>3 - Results</p></li>
</ul>
</td>

<td align="left">
<ul style="list-style:none" class="ellipse" id="'.$step.'">
  <li><p>1 - XPath</p></li>
  <li><p>2 - Treebanks</p></li>
  <li><p>3 - Results</p></li>
</ul>
</td>


<td align="left">
<ul style="list-style:none" class="circular" id="'.$step.'">
  <li><p>1</p></li>
  <li><p>2</p></li>
  <li><p>3</p></li>
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
