<?php
function render_xpath_variables_hidden($formName)
{
    foreach ($_POST[$formName] as $index => $value) {
        $formKey = $formName . "[". $index . "]";
        $name = htmlspecialchars($value['name']);
        $path = htmlspecialchars($value['path']);
    ?>
        <input type="hidden" name="<?=$formKey ?>[name]" value="<?= $name ?>" />
        <input type="hidden" name="<?=$formKey ?>[path]" value="<?= $path ?>" />
    <?php
    }
}
?>