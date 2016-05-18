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
          <li class="web"><a href="http://www.arts.kuleuven.be/ling/ccl" title="Centre for Computational Linguistics homepage">Centre for Computational Linguistics</a></li>
          <li class="tel"  title="Phone number">+32-16-325088</li>
          <li class="fax" title="Fax address">+32-16-325098</li>
        </ul>
        </address>
      </aside>
      <nav class="footer-navigation">
        <h3>Navigation</h3>
          <ul>
              <li><a href="<?php echo $home; ?>/index.php" title="Homepage Gretel" rel="home"
              <?php if ($currentPage == "home") echo 'class="active"'; ?>>Home</a></li>
              <li><a href="<?php echo $home; ?>/ebs/input.php" title="Example-based search"
              <?php if ($currentPage == "ebs") echo 'class="active"'; ?>>Example-based search</a></li>
              <li><a href="<?php echo $home; ?>/xps/input.php" title="XPath search"
              <?php if ($currentPage == "xps") echo 'class="active"'; ?>>XPath search</a></li>
              <li><a href="<?php echo $home; ?>/documentation.php" title="Documentation"
              <?php if ($currentPage == "docs") echo 'class="active"'; ?>>Documentation</a></li>
          </ul>
      </nav>
      <aside class="logo-wrapper">
          <?php include "$root/php/logo-code-gretel.php"; ?>
      </aside>
    </div>
</footer>

<script src="https://code.jquery.com/jquery-2.2.2.min.js" integrity="sha256-36cp2Co+/62rEAAYHLmRCPIych47CvdM+uTBJwSzWjI=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-throttle-debounce/1.1/jquery.ba-throttle-debounce.min.js"></script>
<?php if (isset($taalPortaal) && $taalPortaal): ?>
    <script src="<?php echo $home; ?>/js/min/TaalPortaal.min.js"></script>
<?php endif; ?>
<?php if (isset($treeVisualizer) && $treeVisualizer): ?>
    <script src="<?php echo $home; ?>/js/min/tree-visualizer.min.js"></script>
<?php endif; ?>
<script src="<?php echo $home; ?>/js/min/scripts.min.js"></script>
