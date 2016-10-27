<h3>LASSY Small</h3>
<div class="table-wrapper">
<table>
    <thead>
        <tr>
            <th>
                <label><input type="checkbox" data-check="all-lassy" checked> Treebank</label>
            </th>
            <th>Contents</th>
            <th>Sentences</th>
            <th>Words</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <?php printAvailablityComponent('lassy', 'DPC', true, false); ?>
            <td>Dutch Parallel Corpus</td>
            <td>11,716</td>
            <td>193,029</td>
        </tr>
        <tr>
            <?php printAvailablityComponent('lassy', 'WIKI', true, false); ?>
            <td>Dutch Wikipedia pages</td>
            <td>7,341</td>
            <td>83,360</td>
        </tr>
        <tr>
            <?php printAvailablityComponent('lassy', 'WRPE', true, false); ?>
            <td>E-magazines, newsletters, teletext pages, web sites, Wikipedia</td>
            <td>14,420</td>
            <td>232,631</td>
        </tr>
        <tr>
            <?php printAvailablityComponent('lassy', 'WRPP', true, false); ?>
            <td>Books, brochures, guides and manuals, legal texts, newspapers, periodicals and magazines, policy documents, proceedings, reports, surveys</td>
            <td>17,691</td>
            <td>281,424</td>
        </tr>
        <tr>
            <?php printAvailablityComponent('lassy', 'WSU', true, false); ?>
            <td>Auto cues, news scripts, text for the visually impaired</td>
            <td>14,032</td>
            <td>184,611</td>
        </tr>
        <tfoot>
            <tr>
                <td>LASSY Small</td>
                <td>Complete treebank</td>
                <td>65,200</td>
                <td>975,055</td>
            </tr>
        </tfoot>
    </tbody>
</table>
</div>
