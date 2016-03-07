<!-- zoom.xsl -->
<!-- external stylesheet to include zoom function -->

<!-- RELEASED WITH GrETEL2.0 -->
<!-- written by Liesbeth Augustinus (c) 2014 -->
<!-- for the GrETEL2.0 project -->

<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:svg="http://www.w3.org/2000/svg"
  xmlns:exslt="http://exslt.org/common"
  xmlns:html="http://www.w3.org/TR/html401">

<xsl:template match="/">

<html:html>
  
  <head>
    <title>Tree</title>
    <meta NAME="Tree" CONTENT="Tree"/>
     <link rel="stylesheet" href="/gretel-2.0/style/css/tree_print.css" type="text/css" media="print"/>
     <link rel="stylesheet" href="/gretel-2.0/style/css/mytooltip.css" type="text/css" media="screen"/>
     <script type="text/javascript" language="javascript" src="/gretel-2.0/js/zoom.js"><!-- // --></script>
     <script type="text/javascript" language="javascript" src="/gretel-2.0/js/mytooltip.js"><!-- // --></script>
  </head>
  
  <body id="tree">
    <noscript>
      <h3>Please enable JavaScript to get the full functionality of the page</h3>
    </noscript>
    
    <form>
      <input type="button" value="Zoom In" onClick="zoomIn(treeImage)"/>
      <input type="button" Value="Zoom Out" onClick="zoomOut(treeImage)"/>
      <input type="button" Value="Close Window" onClick="window.close()"/>
      <input type="button" value="View XML" onClick='window.location="view-source:" + window.location.href' />
     </form>
    <span id="tooltiplayout"/> <!-- print out tooltip -->
    <xsl:apply-templates/>
  </body>
  
</html:html>

</xsl:template>
</xsl:stylesheet>
