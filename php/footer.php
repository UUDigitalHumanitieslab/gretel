  </main>
</div>
<footer class="page-footer">
    <div class="content">
      <aside class="contact">
        <h3>Centre for Computational Linguistics</h3>
        <address>
          <ul>
            <li class="address">University of Leuven<br>
          Blijde Inkomststraat 21 box 3315<br>
          3000 Leuven<br>
          Belgium<br></li>
          <li class="web"><a href="http://www.arts.kuleuven.be/ling/ccl" title="Centre for Computational Linguistics homepage"
              target="_blank">Centre for Computational Linguistics</a></li>
          <li class="tel"  title="Phone number">+32-16-325088</li>
          <li class="fax" title="Fax address">+32-16-325098</li>
        </ul>
        </address>
      </aside>
      <nav class="footer-navigation">
        <h3>Navigation</h3>
          <ul>
              <li><a href="index.php" title="Homepage Gretel" rel="home"
              <?php if ($currentPage == "home") echo 'class="active"'; ?>>Home</a></li>
              <li><a href="ebs/input.php" title="Example-based search"
              <?php if ($currentPage == "ebs") echo 'class="active"'; ?>>Example-based search</a></li>
              <li><a href="xps/input.php" title="XPath search"
              <?php if ($currentPage == "xps") echo 'class="active"'; ?>>XPath search</a></li>
              <li><a href="documentation.php" title="Documentation"
              <?php if ($currentPage == "docs") echo 'class="active"'; ?>>Documentation</a></li>
          </ul>
          <!-- <a href="https://github.com/CCL-KULeuven/gretel" title="GrETEL on GitHub" class="github-link" target="_blank">
              <span>GrETEL is available on GitHub!</span>
              <i class="fa fa-fw fa-github fa-3x" aria-hidden="true"></i>
          </a> -->
      </nav>
      <aside class="other">
          <button name="to-top" title="Go to the top of the page"><i class="fa fa-fw fa-arrow-up"></i></button>
              <div class="logo-wrapper">
                  <?php include "$root/img/logo-image-gretel.svg"; ?>
              </div>
      </aside>
    </div>
</footer>

<script id="old-ie-script">
// Check if we're on Internet Explorer
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

<script   src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-throttle-debounce/1.1/jquery.ba-throttle-debounce.min.js"></script>
<?php if (isset($taalPortaal) && $taalPortaal): ?>
    <script src="js/min/taalportaal.min.js"></script>
<?php endif; ?>
<?php if (isset($treeVisualizer) && $treeVisualizer): ?>
    <script src="js/min/tree-visualizer.min.js"></script>
<?php endif; ?>
<script src="js/min/scripts.min.js"></script>
