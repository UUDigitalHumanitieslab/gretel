/* mytooltip.js */

/* GrETEL 2.0 XML tooltip JavaScript */
/* written by Liesbeth Augustinus (c) 2014 */
/* for the GrETEL2.0 project */

/* 
 * html:  <span id="tooltiplayout"/> to print out tooltip
 * example xml/html tag: <element class="tip" id="rel" tooltip="REL" onmouseover="create_tt('rel','tooltiplayout')" onmouseout="remove_tt('tooltiplayout')">
 * tooltip.css
 * every tooltip with another content gets a separate ID
 */

function init() {
if (window.Event) {
	document.captureEvents(Event.MOUSEMOVE);
	}
	document.onmousemove = getXY;
}

function getXY(e){
	x = (window.Event) ? e.pageX : event.clientX;
	y = (window.Event) ? e.pageY : event.clientY;
}

function create_tt(id,tip_layout) {
	if (!document.getElementById) {
		return
	}
	var el = document.getElementById(id);
	var text = el.getAttribute("tooltip");
	tooltip=document.getElementById(tip_layout)
	tooltip.innerHTML=text;
	tooltip.style.visibility='visible';
	tooltip.style.left=(x+10) + 'px'
	tooltip.style.top=(y+10) + 'px'
}

function remove_tt(tip_layout) {
	document.getElementById(tip_layout).style.visibility='hidden';
}
window.onload = init;