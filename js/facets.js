$(function() {
    // Update date range facet with currently selected value and redirect on change in date selection
    $('.facet input.facet-daterange').each(function() {
        var key = $(this).attr('name').split('_')[0];
        var type = $(this).attr('name').split('_')[1];
        var val = getParameterByName(key);
        var min = new Date(Date.parse($(this).attr('data-min')));
        var max = new Date(Date.parse($(this).attr('data-max')));
        var current_min, val_min = min;
        var current_max, val_max = max;

        if (val && val.split('*').length === 2) {
            var val_min = new Date(Date.parse(val.split('*')[0]));
            var val_max = new Date(Date.parse(val.split('*')[1]));
            current_min = minDate(min, val_min);
            current_max = maxDate(max, val_max);
        }

        $(this).datepicker({
            minDate: min,
            maxDate: max,
            changeMonth: true,
            changeYear: true,
            dateFormat: 'yy-mm-dd'
        }).on('change', function() {
            var value = '';
            if (type === 'from') {
                value = $(this).val() + '*' + $(this).next().val();
            } else {
                value = $(this).prev().val() + '*' + $(this).val();
            }
            window.location = updateQueryStringParameter(key, value);
        });

        if ($(this).attr('name').split('_')[1] === 'from') {
            $(this).datepicker('setDate', val_min);
        }
        if ($(this).attr('name').split('_')[1] === 'to') {
            $(this).datepicker('setDate', val_max);
        }

        function minDate(a, b) {
            return a < b ? a : b;
        }

        function maxDate(a, b) {
            return a > b ? a : b;
        }
    });

    // Update range facet with currently selected value and redirect on slide
    $('.facet input.facet-range').each(function() {
        var key = $(this).attr('name');
        var val = getParameterByName(key);
        var min = +$(this).attr('data-min');
        var max = +$(this).attr('data-max');
        var current_min, current_max;

        if (val) {
            current_min = +val.split('*')[0];
            current_max = +val.split('*')[1];
        } else {
            current_min = min;
            current_max = max;
        }

        $(this).val(current_min + " - " + current_max);

        $(this).next().slider({
            range: true,
            min: min,
            max: max,
            values: [current_min, current_max],
            slide: function(event, ui) {
                var value = ui.values[0] + '*' + ui.values[1];
                window.location = updateQueryStringParameter(key, value);
            }
        })
    });

    // Update dropdown facet with currently selected value
    $('.facet select').each(function() {
        var key = $(this).attr('name');
        $(this).val(getParameterByName(key));
    });

    // Redirect on selection
    $('.facet select').on('change', function() {
        var key = $(this).attr('name');
        var value = $(this).val();

        var new_url;
        if (!value) {
            new_url = updateQueryStringParameter(key);
        } else {
            new_url = updateQueryStringParameter(key, value);
        }

        window.location = new_url;
    });

    // Update checkbox facet with currently selected value
    $('.facet input.facet-value').each(function() {
        var key = $(this).parents('div.facet').attr('id');
        var value = $(this).attr('name');

        var val = getParameterByName(key);
        $(this).prop('checked', val === value);
    });

    // Redirect on click
    $('.facet input.facet-value').click(function() {
        var key = $(this).parents('div.facet').attr('id');
        var value = $(this).attr('name');

        var new_url;
        if (!this.checked) {
            new_url = updateQueryStringParameter(key);
        } else {
            new_url = updateQueryStringParameter(key, value);
        }

        window.location = new_url;
    });

    // After click on buttons with the "export" class,
    // save the results using the current URL parameters,
    // adding the print parameter.
    $('.export').click(function() {
        var url = window.location.href.replace('ebs/results.php', 'scripts/SaveResults.php');
        url = updateQueryStringParameter('print', $(this).attr('data-format'), url);
        window.open(url);
    });
});

// Updates the query string parameters
// Found on http://stackoverflow.com/a/11654436/3710392
function updateQueryStringParameter(key, value, url) {
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            return url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        }
    } else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            return url;
        } else
            return url;
    }
}

// Retrieve a query string parameter by name
// Found on http://stackoverflow.com/a/901144/3710392
function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
