<?php
class Analysis
{
    public $continueConstraints = array();
    public $variables;
    public $corpus;

    public function render()
    {
        if ($this->continueConstraints) {
            ?>
            <analysis data-api-url="<?=htmlspecialchars(API_URL) ?>" data-corpus="<?=htmlspecialchars($this->corpus) ?>"></analysis>
            <link rel="stylesheet" href="js/packages/pivottable/pivot.min.css">
            <div id="xpath-variables">
            <?php
            if (isset($this->variables)) {
                foreach ($this->variables as $index => $value) {
                    $name = htmlspecialchars($value['name']);
                    $path = htmlspecialchars($value['path']);
                    ?><span class="path-variable" data-name="<?= $name ?>" data-path="<?= $path ?>"></span><?php
                }
            }
            ?>
            </div>
            <?php
            setContinueNavigation();
        } else {
            ?>
            <p>Something went wrong. It is possible that you came to this page directly without entering the required fields in the previous steps.</p>
            <?php
        }
    }
}
?>
