$(function() {
    // Add radio buttons for each treebank   
    $.getJSON(API + '/treebank', function(data) {
        $.each(data, function(i, e) {
            var radio = $('<input type="radio" name="treebank" />')
                .attr('id', e.title)
                .attr('value', e.title)
                .appendTo('.labels-wrapper');
            radio.wrap('<label for="' + e.title + '"></label>');
            radio.after(' <strong>' + e.title + '</strong>');
            radio.parent().wrap('<div class="label-wrapper"></div>');
        })
    });

    // On selection of a treebank, add a table with selection of components
    $('.labels-wrapper').on('click', 'input[name="treebank"]', function() {
        var treebank = $(this).val();
        $.getJSON(API + '/treebank/show/' + treebank, function(data) {
            console.log('here');
            $('.corpora-wrapper').empty();

            var tbl = $('<table>');
            tbl.append(
                '<thead>' +
                '<tr>' +
                '<th>' +
                '<input type="checkbox" class="check-all" checked></th>' +
                '<th>Component</th>' +
                '<th>Contents</th>' +
                '<th>Sentences</th>' +
                '<th>Words</th>' +
                '</tr>' +
                '</thead>'
            );

            var tbl_body = $('<tbody>');
            $.each(data, function(i, e) {
                var tbl_row = $('<tr>');
                // Add input row
                var input = $('<input type="checkbox" checked>')
                    .attr('data-treebank', treebank)
                    .attr('name', 'subtreebank[]')
                    .val(e.slug);
                tbl_row.append($('<td>').append(input));
                // Add cell values
                $.each(e, function(j, v) {
                    if (j == 'slug' || j == 'title') {
                        tbl_row.append($('<td>').text(v));
                    }
                    else if (j == 'nr_sentences' || j == 'nr_words') {
                        tbl_row.append($('<td>').text(parseInt(v).toLocaleString()));
                    }
                });
                tbl_body.append(tbl_row);
            });
            tbl.append(tbl_body);

            $('.corpora-wrapper').append(tbl);
        });
    });

    // Select all components on click of the 'check-all' input
    $('.corpora-wrapper').on('click', '.check-all', function() {
        var checkboxes = $(this).parents('table').find('tbody input');
        checkboxes.prop('checked', $(this).prop('checked'));
    });
});
