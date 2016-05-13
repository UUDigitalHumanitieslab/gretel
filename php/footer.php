  </main>
</div>
<footer class="page-footer">
    <div class="content">
      <span>
        A project at
        <a href="http://www.arts.kuleuven.be/ling/ccl" title="Centre for Computational Linguistics">
          Centre for Computational Linguistics
        </a>
      </span>
        <a href="<?php echo $home; ?>" title="Home" rel="home" class="logo-link-gretel">
          <?php include "$root/php/logo-code-gretel.php"; ?>
        </a>
    </div>
</footer>

<?php if (!isset($jsScripts) || $jsScripts): ?>
<script src="https://code.jquery.com/jquery-2.2.2.min.js" integrity="sha256-36cp2Co+/62rEAAYHLmRCPIych47CvdM+uTBJwSzWjI=" crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-throttle-debounce/1.1/jquery.ba-throttle-debounce.min.js"></script>
<?php if (isset($taalPortaal) && $taalPortaal): ?>
    <script src="<?php echo $home; ?>/js/min/TaalPortaal.min.js"></script>
<?php endif; ?>
<?php if (isset($treeVisualizer) && $treeVisualizer): ?>
    <script src="<?php echo $home; ?>/js/min/tree-visualizer.min.js"></script>
<?php endif; ?>
<script src="<?php echo $home; ?>/js/min/scripts.min.js"></script>
<?php endif; ?>
