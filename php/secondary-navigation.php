<nav class="secondary-navigation">
    <ul class="progressbar">
        <?php if ($currentPage == "ebs"): ?>
            <li <?php setProgressClasses(1); ?>><p>1<span> - Example</span></p></li>
            <li <?php setProgressClasses(2); ?>><p>2<span> - Parse</span></p></li>
            <li <?php setProgressClasses(3); ?>><p>3<span> - Matrix</span></p></li>
            <li <?php setProgressClasses(4); ?>><p>4<span> - Treebank</span></p></li>
            <li <?php setProgressClasses(5); ?>><p>5<span> - Query</span></p></li>
            <li <?php setProgressClasses(6); ?>><p>6<span> - Results</span></p></li>
        <?php else: ?>
            <li <?php setProgressClasses(1); ?>><p>1<span> - XPath</span></p></li>
            <li <?php setProgressClasses(2); ?>><p>2<span> - Treebanks</span></p></li>
            <li <?php setProgressClasses(3); ?>><p>3<span> - Results</span></p></li>
        <?php endif; ?>
    </ul>
</nav>
