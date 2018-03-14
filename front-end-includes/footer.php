  </main>
</div>
<?php
require_once ROOT_PATH."/package.php";
?>
<footer class="page-footer">
    <div class="content">
      <aside class="contact">
        <h3>Digital Humanities Lab</h3>
        <address>
          <ul>
            <li class="address fa-before">Utrecht University<br>
          Drift 10, room 3.07<br>
          3512 BS Utrecht<br>
          Netherlands<br></li>
          <li class="web fa-before"><a href="https://dig.hum.uu.nl" title="Digital Humanities Lab"
              target="_blank">Digital Humanities Lab</a></li>
          <li class="tel fa-before"  title="Phone number">+31 30 253 7867</li>
          <li class="email fa-before"><a href="mailto:s.j.j.spoel@uu.nl" title="Email us">s.j.j.spoel@uu.nl</a></li>
        </ul>
        </address>
      </aside>
      <aside class="footer-nav-wrapper">
        <nav class="footer-navigation">
          <h3>Navigation</h3>
            <ul>
                <li class="fa-before fa-loaded"><a href="../home" title="Homepage Gretel" rel="home">Home</a></li>
                <li class="fa-before fa-loaded"><a href="ebs/input.php" title="Example-based search">Example-based search</a></li>
                <li class="fa-before fa-loaded"><a href="xps/input.php" title="XPath search">XPath search</a></li>
                <li class="fa-before fa-loaded"><a href="../documentation" title="Documentation">Documentation</a></li>
            </ul>
        </nav>
        <div class="authors">
            <h3>Credits</h3>
            <p>
              Concept and initial implementation at <a href="http://www.arts.kuleuven.be/ling/ccl" title="Centre for Computational Linguistics homepage"
              target="_blank">Centre for Computational Linguistics</a> (University of Leuven).
            </p>
            <p>
                <li><a href="http://www.ccl.kuleuven.be/~liesbeth/" title="Liesbeth Augustinus homepage" target="_blank" rel="author" lang="nl-BE">Liesbeth Augustinus</a></li>
                <li><a href="http://www.ccl.kuleuven.be/~vincent/ccl/" title="Vincent Vandeghinste homepage" target="_blank" rel="author" lang="nl-BE">Vincent Vandeghinste</a></li>
                <li><a href="http://bramvanroy.be" title="Bram Vanroy homepage" target="_blank" rel="author" lang="nl-BE">Bram Vanroy</a></li>
            </p>
            <p>
              GrETEL 4 at <a href="https://dig.hum.uu.nl/" target="_blank">Digital Humanties Lab</a> (Utrecht University).
            </p>
            <p>
                <li><a href="https://www.uu.nl/staff/JEJMOdijk" title="Jan Odijk homepage" target="_blank" rel="author" lang="nl-NL">Jan Odijk</a> (project lead)</li>
                <li><a href="https://www.uu.nl/staff/MHvanderKlis" title="Martijn van der Klis homepage" target="_blank" rel="author" lang="nl-NL">Martijn van der Klis</a></li>
                <li><a href="https://www.uu.nl/staff/SJJSpoel" title="Sheean Spoel homepage" target="_blank" rel="author" lang="nl-NL">Sheean Spoel</a></li>
                <li><a href="https://www.uu.nl/staff/GFoks" title="Gerson Foks homepage" target="_blank" rel="author" lang="nl-NL">Gerson Foks</a></li>
            </p>
      <p><?php echo "version ".VERSION." ".DATE;?></p>
        </div>
      </aside>
      <aside class="other">
          <button name="to-top" title="Go to the top of the page" type="button">
            <i class="fa fa-fw fa-arrow-up fa-loaded"></i>
            <span class="sr-only">Go to the top of the page</span>
          </button>
          <div class="logo-wrapper">
            <?php include ROOT_PATH."/img/logo-image-gretel.svg"; ?>
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
<script src="http://code.jquery.com/ui/1.12.1/jquery-ui.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-throttle-debounce/1.1/jquery.ba-throttle-debounce.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.1.4/js.cookie.min.js"></script>
<?php if (isset($treeVisualizer) && $treeVisualizer):
    if (isset($onlyFullscreenTv) && $onlyFullscreenTv) {
        include ROOT_PATH."/front-end-includes/tv-wrappers.php";
    } ?>
    <script src="js/tree-visualizer.js"></script>
<?php endif; ?>
<script src="js/min/scripts.min.js"></script>

<?php if (API_URL) : ?>
  <script>var API = '<?=API_URL; ?>';</script>
  <script src="js/min/api.min.js"></script>
<?php endif; ?>
<script type="text/javascript" src="js/ts/main.js"></script>
