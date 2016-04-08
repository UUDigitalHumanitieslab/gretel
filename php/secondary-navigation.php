<nav class="secondary-navigation">
    <ul class="progressbar">
        <?php if ($currPage == "ebs"): ?>
            <li <?php addStepClass(1); ?>><p>1<span> - Example</span></p></li>
            <li <?php addStepClass(2); ?>><p>2<span> - Parse</span></p></li>
            <li <?php addStepClass(3); ?>><p>3<span> - Matrix</span></p></li>
            <li <?php addStepClass(4); ?>><p>4<span> - Treebank</span></p></li>
            <li <?php addStepClass(5); ?>><p>5<span> - Query</span></p></li>
            <li <?php addStepClass(6); ?>><p>6<span> - Results</span></p></li>
        <?php else: ?>
            <li <?php addStepClass(1); ?>><p>1<span> - XPath</span></p></li>
            <li <?php addStepClass(2); ?>><p>2<span> - Treebanks</span></p></li>
            <li <?php addStepClass(3); ?>><p>3<span> - Results</span></p></li>
        <?php endif; ?>
    </ul>
</nav>

<?php
function addStepClass($index) {
    global $step;
    if ($step == $index) echo 'class="active"';
    elseif ($step > $index) echo 'class="done"';
}
?>
