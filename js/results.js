$(document).ready(function() {
    var hash = window.location.hash,
        tvLink = $("a.tv-show-fs"),
        resultID = 0,
        stop = false,
        searchBgCheck = $('[name="continue-bg"]'),
        done = false;

    getSentences();

    setTimeout(function() {
        $.get(phpVars.fetchCountsPath, function(count) {
            if (count) {
                count = numericSeparator(count);
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
        $(".loading-wrapper.searching").addClass("active");
        $.get(phpVars.fetchResultsPath, function(json) {
            var data = $.parseJSON(json);
            $(".results-wrapper tbody .added").removeClass("added");
            if (data.data) {
                if (!stop && !done) getSentences();
                $.each(data.data, function(id, value) {
                    resultID++;
                    var link = value[0];

                    link = link.replace(/\bhref=\"([^"]+)\"/, "href=\"#tv-" + resultID + "\" data-tv-url=\"$1\"");

                    $(".results-wrapper tbody").append('<tr class="added"><td>' + link + '</td><td>' +
                        value[1] + '</td></tr>');
                });
                $(".results-wrapper").fadeIn("fast");
                resultIDString = numericSeparator(resultID);
                $(".count strong").text(resultIDString);

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
                $(".loading-wrapper.searching").removeClass("active");
                done = true;
            }
        });
    }


    function numericSeparator(integer) {
        return integer.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
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
            $(".loading-wrapper.searching").removeClass("active");
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

    var top = $(".controls")[0].getBoundingClientRect().top + $(".controls").scrollTop(),
        h = $(".controls")[0].getBoundingClientRect().height,
        dummy = $(".dummy-controls");

    dummy.height(h);

    $(window).scroll(function() {
        var $this = $(this);

        if ($this.scrollTop() >= top) {
            dummy.addClass("active");
            $(".controls").addClass("scroll");
        } else {
            dummy.removeClass("active");
            $(".controls").removeClass("scroll");
        }
    });

    $("[name='to-top']").click(function() {
        $("html, body").animate({
            scrollTop: 0
        });
    });
});
