/* GrETEL 2.0 zoom JavaScript */
/* written by Liesbeth Augustinus (c) 2014 */
/* for the GrETEL2.0 project */

var nW,nH,oH,oW,nWidth,nHeight,treeImage,onW,onH,ooH,ooW,onWidth,onHeight;
treeImage=document.getElementById("tree");

function printTree()
{   	
    //pop-up print menu
    window.print();
}

function zoomIn(whichImage)
{
	oH = document.getElementById("tree").offsetHeight;
	oW = document.getElementById("tree").offsetWidth;
	//zoom scale
	nW=oW*1.1; nH=oH*1.1;
	nWidth=(nW+"px"); nHeight=(nH+"px");
	whichImage.style.width=nWidth;
	whichImage.style.height=nHeight;
	//if (document.getElementById) {document.getElementById("tree").style.height=nHeight};
	//if (document.getElementById){document.getElementById("tree").style.width=nWidth};
}

function zoomOut(whichImage)
{
	ooH = document.getElementById("tree").offsetHeight;
	ooW = document.getElementById("tree").offsetWidth;
	//zoom scale
	onW=ooW*0.9; onH=ooH*0.9;
	onWidth=(onW+"px"); onHeight=(onH+"px");
	whichImage.style.width=onWidth;
	whichImage.style.height=onHeight;
}

function zoomOrg()
{
	location.reload();
}

function showTooltip(txt)
{

	document.getElementById("tip").innerHTML=txt;
	}

function zoom()
{
	oH = document.getElementById("tree").offsetHeight;
	oW = document.getElementById("tree").offsetWidth;
	document.write(oW);
	document.write("\n");
	document.write(oH);
	}
