$(document).ready(function() {
    var hash = window.location.hash,
        tvLink = $("a.tv-show-fs"),
        elId = 0,
        stop = false,
        searchBgCheck = $('[name="continue-bg"]'),
        done = false;

    getSentences();

    setTimeout(function() {
        $.get(phpVars.fetchCountsPath, function(count) {
            if (count) {
                $(".count span").text(count);
            }
        });
    }, 5000);

    if (hash) {
        if (hash.indexOf("tv-") == 1) {
            var index = hash.match(/\d+$/);
            tvLink.eq(index[0] - 1).click();
        }
    }

    function getSentences() {
        $.get(phpVars.fetchResultsPath, function(json) {
            var data = $.parseJSON(json);
            $(".results-wrapper tbody .added").removeClass("added");
            if (data.data) {
                $.each(data.data, function(id, value) {
                    elId++;
                    var link = value[0];

                    link = link.replace(/\bhref=\"([^"]+)\"/, "href=\"#tv-" + elId + "\" data-tv-url=\"$1\"");

                    $(".results-wrapper tbody").append('<tr class="added"><td>' + link + '</td><td>' +
                        value[1] + '</td></tr>');
                });
                $(".results-wrapper").fadeIn("fast");
                $(".count strong").text(elId);
                if (!stop) getSentences();
            } else {
                if (data.error) {
                    $(".btn-wrapper").remove();
                    $(".error p").text("Error! " + data.error_msg);
                    $(".error").fadeIn("slow");
                } else if ($(".results-wrapper tbody").children().length == 0) {
                    $(".btn-wrapper").remove();
                    $(".error p").text("No results found!");
                    $(".error").fadeIn("slow");
                } else {
                    $(".notice p").text("All results have been found!");
                    $(".btn-wrapper").find("button, input").prop("disabled", true);
                    $(".btn-wrapper").find("label").addClass("disabled");
                }
                done = true;
            }
        });
    }


    $(".results-wrapper tbody").on("click", "a.tv-show-fs", function(e) {
        var $this = $(this);
        $(".loading-wrapper").addClass("active");
        window.history.replaceState("", document.title, window.location.pathname + $this.attr("href"));
        body.treeVisualizer($this.data("tv-url"), {
            normalView: false,
            initFSOnClick: true
        });
        e.preventDefault();
    });


    $(".stop").click(function() {
        if (!stop && !done) {
            stop = true;
            $(".continue").prop("disabled", false);
            $(this).prop("disabled", true);
        }
    });
    $(".continue").click(function() {
        if (stop && !done) {
            stop = false;
            $(".stop").prop("disabled", false);
            $(this).prop("disabled", true);
            getSentences();
        }
    });


    $(window).focus(function() {
        if (!searchBgCheck.is(":checked")) $(".continue").click()
    }).blur(function() {
        if (!searchBgCheck.is(":checked")) $(".stop").click();
    });
});
