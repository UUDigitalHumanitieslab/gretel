<?xml version="1.0"?>
<!-- xml2tree-sonar-zoom.xsl -->
<!-- RELEASED WITH GrETEL2.0 -->
<!-- written by Liesbeth Augustinus (c) 2014 -->
<!-- for the GrETEL2.0 project -->

<xsl:stylesheet version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:svg="http://www.w3.org/2000/svg"
  xmlns:exslt="http://exslt.org/common">
  xmlns:html="http://www.w3.org/TR/html401">
<xsl:output method="html" encoding="utf-8" indent="yes"/>
  <!-- xsl:output method="xml" encoding="iso-8859-1" indent="yes"/ -->

  <!-- adapted from Jirka Kosek's page at 
       http://www.xml.com/pub/a/2004/09/08/tree.html -->

  <xsl:include href="zoom.xsl"/>

  <xsl:variable name="xunit" select="35"/>
  <xsl:variable name="yunit" select="40"/>

  <xsl:template match="/alpino_ds">
    <xsl:variable name="layoutTree">
      <xsl:apply-templates select="/alpino_ds/node" mode="xml2layout"/>
    </xsl:variable>
    <xsl:call-template name="layout2svg">
      <xsl:with-param name="layout" select="exslt:node-set($layoutTree)"/>
      <xsl:with-param name="sentence" select="/alpino_ds/sentence/text()"/>
      <!-- xsl:with-param name="comments">
        <xsl:apply-templates select="/alpino_ds/comments/comment"/>
      </xsl:with-param -->
    </xsl:call-template>
  </xsl:template>

  <!-- xsl:template match="comment">
    <xsl:text>comment: </xsl:text>
    <xsl:apply-templates select="text()"/>
    <xsl:text>  </xsl:text>
  </xsl:template -->

  <xsl:template match="node[node]" mode="xml2layout">
    <xsl:param name="depth" select="1"/>
    <xsl:variable name="subTree">
      <xsl:apply-templates select="node" mode="xml2layout">
        <xsl:with-param name="depth" select="$depth+1"/>
      </xsl:apply-templates>
    </xsl:variable>
    
    <!-- Add layout attributes to the existing node -->
    <node depth="{$depth}" width="{sum(exslt:node-set($subTree)/node/@width)}">
      <!-- Copy original attributes and content -->
      <xsl:copy-of select="@*"/>
      <xsl:copy-of select="$subTree"/>
    </node>
    
  </xsl:template>
  
  <!-- Add layout attributes to leaf nodes -->
  <xsl:template match="node" mode="xml2layout">
    <xsl:param name="depth" select="1"/>
    <xsl:variable name="label">
      <xsl:choose>
        <xsl:when test = "@pt = 'UNKNOWN'">
          <xsl:text>capitalslong</xsl:text>
        </xsl:when>
	 <xsl:when test = "string-length(@word) &gt; string-length(@lemma) 
          and string-length(@word) &gt; string-length(@rel)">
          <xsl:value-of select="@word"/>
	 </xsl:when>
        <xsl:when test = "string-length(@lemma) &gt; string-length(@pt) 
          and string-length(@lemma) &gt; string-length(@rel)">
          <xsl:value-of select="@lemma"/>
        </xsl:when>
        <xsl:when test = "string-length(@pt) &gt; string-length(@rel) ">
          <xsl:value-of select="@pt"/>
        </xsl:when>
        <xsl:otherwise>
          <xsl:value-of select="@rel"/>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <node depth="{$depth}" width="{0.2 + string-length($label) *0.12}">
      <xsl:copy-of select="@*"/>
    </node>
  </xsl:template>
  
  <!-- Convert layout to SVG -->
  <xsl:template name="layout2svg">
    <xsl:param name="layout"/>
    <xsl:param name="sentence"/>
    <xsl:param name="comments"/>
    
    <!-- Find depth of the tree -->
    <xsl:variable name = "maxDepth">
      <xsl:for-each select = "$layout//node">
        <xsl:sort select = "@depth" data-type = "number" order = "descending"/>
        <xsl:if test = "position() = 1">
          <xsl:value-of select = "@depth"/>
        </xsl:if>
      </xsl:for-each>
    </xsl:variable>
        
      
    <!-- Create SVG wrapper -->
    <svg:svg viewBox = "{-1 * $xunit} {-1 * $yunit} {sum($layout/node/@width) * 2 * $xunit + $xunit} {$maxDepth * 2 * $yunit + 4 * $yunit}" style="text-anchor:middle">
      <xsl:apply-templates select = "$layout/node" mode = "layout2svg"/>
      
      <!-- print sentence and comments -->
      <svg:text  x="0" y="0" text-anchor="start" fill="black">
            <xsl:value-of select="$sentence"/>
      </svg:text>
      <xsl:if test="/alpino_ds/@id">
      <svg:text  x="0" y="20" text-anchor="start" fill="black">
	 <xsl:value-of select="/alpino_ds/@id"/>
	  </svg:text>
      </xsl:if>

      <!-- xsl:choose>
        <xsl:when test="/alpino_ds/@id">
	  <svg:text  x="0" y="0" text-anchor="start" fill="black">
            <xsl:value-of select="/alpino_ds/@id"/>
	     <xsl:text> : </xsl:text>
	    <xsl:value-of select="$sentence"/>
	  </svg:text>
	</xsl:when>
	<xsl:otherwise>
	  <svg:text  x="0" y="0" text-anchor="start" fill="black">
            <xsl:value-of select="$sentence"/>
	  </svg:text>
	</xsl:otherwise>
      </xsl:choose -->

      <!-- svg:text x="0" y="{$maxDepth * 2 * $yunit + $yunit + $yunit}" text-anchor="start">
        <xsl:value-of select="$comments"/>
      </svg:text -->
      
    </svg:svg>
  </xsl:template>
        
  <!-- Draw one node -->
  <xsl:template match = "node" mode = "layout2svg">
    <!-- Calculate X coordinate -->
    <xsl:variable name="x" select = "(sum(preceding::node[@depth = current()/@depth or (not(node) 
      and @depth &lt;= current()/@depth)]/@width) + (@width div 2)) * 2 * $xunit"/>
    <!-- Calculate Y coordinate -->
    <xsl:variable name = "y" select = "@depth * 2 * $yunit"/>
    <!-- Draw label of node -->
    <!-- Highlight match -->
    <xsl:if test="@highlight and @rel">
      <svg:text x = "{$x}" y = "{$y - 30}" fill="red" class="tip" id="rel" tooltip="REL" onmouseover="create_tt('rel','tooltiplayout')" onmouseout="remove_tt('tooltiplayout')">
	<xsl:value-of select="@rel"/>
      </svg:text>
    </xsl:if>

    <xsl:if test="not(@highlight) and @rel">
      <svg:text x = "{$x}" y = "{$y - 30}" fill="black"  class="tip" id="rel" tooltip="REL" onmouseover="create_tt('rel','tooltiplayout')" onmouseout="remove_tt('tooltiplayout')">
	<xsl:value-of select="@rel"/>
      </svg:text>
    </xsl:if>

     <svg:text x = "{$x}" y = "{$y - 10}">
      <xsl:value-of select="@index"/>
      <xsl:if test = "@index and (@cat|@pt)">
        <xsl:text>:</xsl:text>
      </xsl:if>
      <xsl:value-of select="@cat|@pt"/>
    </svg:text>
  
  <xsl:if test = "@cat">    
    <svg:text x = "{$x}" y = "{$y - 10}" class="tip" id="cat" tooltip="CAT" onmouseover="create_tt('cat','tooltiplayout')" onmouseout="remove_tt('tooltiplayout')" >
      <xsl:value-of select="@index"/>
      <xsl:if test = "@index and @cat">
        <xsl:text>:</xsl:text>
      </xsl:if>
      <xsl:value-of select="@cat"/>
    </svg:text>
  </xsl:if>
        
  <xsl:if test = "@pt">  
    <svg:text x = "{$x}" y = "{$y - 10}" class="tip" id="{@postag}+id" tooltip="POS={@postag}" onmouseover="create_tt('{@postag}+id','tooltiplayout')" onmouseout="remove_tt('tooltiplayout')">
      <xsl:value-of select="@index"/>
      <xsl:if test = "@index and @pt">
        <xsl:text>:</xsl:text>
      </xsl:if>
      <xsl:value-of select="@pt"/>
    </svg:text>
  </xsl:if>
 
  <xsl:if test = "not(@pt) and @pos">
    <svg:text x = "{$x}" y = "{$y - 10}" class="tip" id="pos" tooltip="Alpino POS" onmouseover="create_tt('pos','tooltiplayout')" onmouseout="remove_tt('tooltiplayout')"  >
      <xsl:value-of select="@index"/>
      <xsl:if test = "@index and (@cat|@pos)">
        <xsl:text>:</xsl:text>
      </xsl:if>
      <xsl:value-of select="@cat|@pos"/>
    </svg:text>
  </xsl:if>
 
  <xsl:if test = "@lemma">
      <svg:text x = "{$x}" y = "{$y + 10}" fill="black" class="tip" id="{@root}+id" tooltip="ROOT={@root}" onmouseover="create_tt('{@root}+id','tooltiplayout')" onmouseout="remove_tt('tooltiplayout')">
        <xsl:value-of select="@lemma"/>
      </svg:text>
    </xsl:if>
  
  <xsl:if test = "not(@lemma) and @root">
    <svg:text x = "{$x}" y = "{$y + 10}" fill="black"  class="tip" id="root" tooltip="ROOT" onmouseover="create_tt('root','tooltiplayout')" onmouseout="remove_tt('tooltiplayout')" >
      <xsl:value-of select="@root"/>
    </svg:text>
  </xsl:if>
  
  <xsl:if test = "@word">
    <svg:text x = "{$x}" y = "{$y + 30}" fill="grey" font-style="italic" >
      <xsl:value-of select="@word"/>
    </svg:text>
  </xsl:if>
    
    <!-- Draw connector lines to all sub-nodes -->
    <xsl:for-each select="node">
      <svg:line x1 = "{$x}" y1 = "{$y}"
        x2 = "{(sum(preceding::node[@depth = current()/@depth or (not(node) 
        and @depth &lt;= current()/@depth)]/@width) + (@width div 2)) * 2 * $xunit}"
        y2 = "{@depth * 2 * $yunit - 50}"  stroke="grey"/>
     </xsl:for-each>

     <!-- Draw sub-nodes -->
     <xsl:apply-templates select = "node" mode = "layout2svg"/>
  </xsl:template>
              
</xsl:stylesheet>
