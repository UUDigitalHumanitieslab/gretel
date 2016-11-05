  </main>
</div>
<footer class="page-footer">
    <div class="content">
      <aside class="contact">
        <h3>Centre for Computational Linguistics</h3>
        <address>
          <ul>
            <li class="address fa-before">University of Leuven<br>
          Blijde Inkomststraat 21 box 3315<br>
          3000 Leuven<br>
          Belgium<br></li>
          <li class="web fa-before"><a href="http://www.arts.kuleuven.be/ling/ccl" title="Centre for Computational Linguistics homepage"
              target="_blank">Centre for Computational Linguistics</a></li>
          <li class="tel fa-before"  title="Phone number">+32-16-325088</li>
          <li class="fax fa-before" title="Fax address">+32-16-325098</li>
          <li class="email fa-before"><a href="mailto:gretel@ccl.kuleuven.be" title="Email us">gretel@ccl.kuleuven.be</a></li>
        </ul>
        </address>
      </aside>
      <nav class="footer-navigation">
        <h3>Navigation</h3>
          <ul>
              <li class="fa-before"><a href="index.php" title="Homepage Gretel" rel="home">Home</a></li>
              <li class="fa-before"><a href="ebs/input.php" title="Example-based search">Example-based search</a></li>
              <li class="fa-before"><a href="xps/input.php" title="XPath search">XPath search</a></li>
              <li class="fa-before"><a href="documentation.php" title="Documentation">Documentation</a></li>
          </ul>
      </nav>
      <aside class="other">
          <button name="to-top" title="Go to the top of the page" type="button">
            <i class="fa fa-fw fa-arrow-up"></i>
            <span class="sr-only">Go to the top of the page</span>
          </button>
          <div class="logo-wrapper">
            <?php include "$root/img/logo-image-gretel.svg"; ?>
          </div>
      </aside>
    </div>
</footer>

<div id="popup-wrapper"></div>

<?php
  // Check if we're on IE, if so display a warning message
  // WE DO NOT SUPPORT IE (but we do support the newer Edge)
 ?>
<script id="old-ie-script">
var ua = window.navigator.userAgent,
  msie = ua.indexOf('MSIE '),
  trident = ua.indexOf('Trident/'),
  isIE = (msie > -1 || trident > -1) ? true : false;

if (isIE) {
  var ieStyle = document.createElement("link");
  ieStyle.href = '<?php echo "style/css/min/ie.min.css"; ?>';
  ieStyle.rel = "stylesheet";

  document.getElementsByTagName('head')[0].appendChild(ieStyle);
  document.body.innerHTML += '<div class="ie-overlay"></div><div class="is-ie"><p>You are using an old, <em>old</em> browser that is not supported by our website. '
    + 'We highly encourage you to <a href="http://browsehappy.com/" title="Choose a new browser">update or change your browser</a> to enjoy a '
    + 'faster, safer, and more fun Internet experience.</p>'
    + '<p>After updating or changing your browser, we invite you to come back to our website and use GrETEL as it was intended to be used.</p>'
    + '<i class="fa fa-fw fa-internet-explorer" aria-hidden="true"></i></div>';

}
</script>

<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-throttle-debounce/1.1/jquery.ba-throttle-debounce.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.1.3/js.cookie.min.js"></script>
<?php if (isset($treeVisualizer) && $treeVisualizer): ?>
    <script src="js/min/tree-visualizer.min.js"></script>
<?php endif; ?>
<script src="js/min/scripts.min.js"></script>
