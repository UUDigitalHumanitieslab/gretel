/**
 * Documentation loosely based on the JSDoc standard
 */
$(document).ready(function() {
    // Customizable attributes!
    // Specify how long it should take for functions to session
    // * Before counting ALL hits, independent of current fetched results (ms)
    // * Before ALL results are being gathered on the background (ms), OR
    // * Amount of hits before ALL results are being gathered (hits)
    var timeoutBeforeCount = 5000,
        timeoutBeforeMore = 7000,
        xResultsBeforeMore = 10;

    var hash = window.location.hash,
        tvLink = $("a.tv-show-fs"),
        xhrAllSentences,
        resultID = 0,
        resultsCount = 0,
        stop = false,
        done = false,
        doneCounting = false;

    getSentences();

/* Open tree visualizer if a hash is persent in URL. Not implemented yet
    if (hash) {
        if (hash.indexOf("tv-") == 1) {
            var index = hash.match(/\d+$/);
            tvLink.eq(index[0] - 1).click();
        }
    }
*/
    function getSentences() {
        if (!done && (resultID <= phpVars.resultsLimit)) {
            $(".loading-wrapper.searching").addClass("active");
            $.ajax(phpVars.fetchResultsPath)
                .done(function(json) {
                    if (!done) {
                        var data = $.parseJSON(json);
                        $(".results-wrapper tbody:not(.empty) .added").removeClass("added");
                        if (!data.error && data.data) {
                            loopResults(data.data, false);
                        } else {
                            $(".loading-wrapper.searching").removeClass("active");
                            $(".results-wrapper tbody:not(.empty) .added").removeClass("added");
                            $(".messages").addClass("active");
                            if (data.error) {
                                messageOnError(data.data)
                            } else if ($(".results-wrapper tbody:not(.empty)").children().length == 0) {
                                messageNoResultsFound();
                            } else {
                                messageAllResultsFound();
                                clearTimeout(findAllTimeout);
                            }

                            done = true;
                            $(".stop").click();
                            if (xhrAllSentences) xhrAllSentences.abort();
                        }
                    }
                })
                .fail(function(jqXHR, textStatus, error) {
                    if (error != 'abort') {
                        var string = "An error occurred: " + error + ".";
                        messageOnError(string);
                    }
                })
                .always(function() {
                    if ((resultID == xResultsBeforeMore) && !done) {
                        findAll();
                    }
                });
        }
    }
    var findAllTimeout = setTimeout(function() {
        findAll();
    }, timeoutBeforeMore);

    function findAll() {
        xhrAllSentences = $.ajax(phpVars.getAllResultsPath)
            .done(function(json) {
                var data = $.parseJSON(json);
                $(".results-wrapper tbody:not(.empty) .added").removeClass("added");
                if (!data.error && data.data) {
                    loopResults(data.data, true);
                    messageAllResultsFound();

                    $(".stop").click();
                    clearTimeout(findAllTimeout);
                } else {
                    $(".loading-wrapper.searching").removeClass("active");
                    $(".messages").addClass("active");
                    if (data.error) {
                        messageOnError(data.data);
                    } else if ($(".results-wrapper tbody:not(.empty)").children().length == 0) {
                        messageNoResultsFound();
                    }
                }
            })
            .fail(function(jqXHR, textStatus, error) {
                if (error != 'abort') {
                    var string = "An error occurred: " + error + ".";
                    messageOnError(string);
                }
            })
            .always(function() {
                done = true;
                $(".stop").click();
            });
    }

    setTimeout(function() {
        $.get(phpVars.fetchCountsPath, function(count) {
            if (count) {
                count = parseInt(count);
                $(".notice small").remove();
                resultsCount = numericSeparator(count);
                $(".count strong + span").text(resultsCount);
                $(".notice strong").text(resultsCount);

                doneCounting = true;
            }
        });
    }, timeoutBeforeCount);

    /**
     * Converts an integer with four or more digits to a comma-separated string
     * @param {number} integer - Any (positive) integer
     * @example
     * // returns 1,234,567
     * numericSeparator(1234567);
     * @returns {string} Returns thhe string representation of the number.
     */
    function numericSeparator(integer) {
        if (Number.isInteger(integer) && integer > 999) {
            return integer.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
        }
        return integer;
    }

    function messageAllResultsFound() {
        $(".loading-wrapper.searching").removeClass("active");
        $(".controls").find(".stop, .continue").prop("disabled", true);
        disableAndEnableInputs();
        var stringCount = doneCounting ? [resultsCount, ''] : ['--', '<small>(still counting)</small>'];
        notice = '<strong>' + stringCount[0] + '</strong> result(s) have/has been found! ' + stringCount[1];
        if (resultID >= phpVars.resultsLimit) {
            notice += '<br>We have restricted the output to 500 hits. ' +
                'You can find the reason for this <a href="' + phpVars.fetchHomePath + '/documentation.php#faq-1" ' +
                'title="Why is the output limited to 500 sentences?" target="_blank">in our FAQ</a>.';
        }
        $(".notice p").html(notice);

        $(".messages").addClass("active");
        $(".notice").addClass("active");

        $(".notice").one("transitionend", function() {
            setDummyVariables();
        });
    }

    function messageNoResultsFound() {
        $(".controls").remove();
        $(".error p").text("No results found!");

        $(".messages").addClass("active");
        $(".error").addClass("active");

        $(".error").one("transitionend", function() {
            setDummyVariables();
        });
    }

    function messageOnError(error) {
        $(".controls").remove();
        $(".error p").text("Error! " + error);

        $(".messages").addClass("active");
        $(".error").addClass("active");

        $(".error").one("transitionend", function() {
            setDummyVariables();
        });
    }

    function loopResults(sentences, returnAllResults) {
        if (returnAllResults) {
            done = true;
            resultID = 0;

            $(".results-wrapper tbody:not(.empty)").empty();
            $(".loading-wrapper.searching").removeClass("active");
        }
        $.each(sentences, function(id, value) {
            if (returnAllResults || (!returnAllResults && !done)) {
                resultID++;
                var link = value[0];
                link = link.replace(/\bhref=\"([^"]+)\"/, "href=\"#tv-" + resultID + "\" data-tv-url=\"$1\"");
                var treebank = link.match(/(?:&db=)([^&"=]+)/)[1],
                    linkText = link.match(/(?:>)([^<>]+)(?:<\/a>)/)[1],
                    component = '',
                    componentString = '';

                if (treebank == "lassy") {
                    component = linkText.match(/([^<>]+?)(?:-\d+(?:-|\.).*)/)[1];
                    component = component.replace(/^((?:[a-zA-Z]{3,4})|(?:WR(?:-[a-zA-Z]){3}))-.*/, '$1');

                    componentString = component.replace(/-/g, '');
                    componentString = componentString.slice(0, 4);
                } else if (treebank == "cgn") {
                    component = linkText.match(/([^<>\d]+)/)[1];
                    component = component.slice(1);

                    componentString = component.replace(/-/g, '');
                } else {
                    component = linkText.match(/^([a-zA-Z]{2}(?:-[a-zA-Z]){3})/)[1];
                    componentString = component.replace(/-/g, '');
                }

                component = component.toUpperCase();
                componentString = componentString.toUpperCase();

                $(".results-wrapper tbody:not(.empty)").append('<tr data-result-id="' + resultID + '" data-component="' + componentString + '">' +
                    '<td>' + resultID + '</td><td>' + link + '</td><td>' +
                    component + '</td><td>' + value[1] + '</td></tr>');
            }
        });

        $(".results-wrapper").fadeIn("fast");
        resultIDString = numericSeparator(resultID);
        $(".count strong").text(resultIDString);

        if (!stop && !returnAllResults) {
            getSentences();
        }
    }

    $(".stop").click(function() {
        if (!stop) {
            stop = true;
            $(".loading-wrapper.searching").removeClass("active");
            $(this).prop("disabled", true);
            $(".continue").prop("disabled", done);
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



    $(".controls [name='to-top']").click(function() {
        $("html, body").animate({
            scrollTop: 0
        });
    });

    $(".controls [name='go-to']").keyup(function(e){
        var keycode = e.keyCode,
        $this = $(this);
        // Reset customValidity on backspace or delete keys
        if (keycode == 8 || keycode == 46 || keycode == 38 || keycode == 40) {
            this.setCustomValidity("");
            // UP arrow
            if (keycode == 38) $this.val(parseInt($this.val(), 10)+1).change();
            // DOWN arrow
            if (keycode == 40) $this.val(parseInt($this.val(), 10)-1).change();
        }
    })
    .change(function() {
        var val = $(this).val(),
            row = $(".results-wrapper tbody:not(.empty) tr[data-result-id='" + val + "']");

        if (!row.is(":visible")) {
            this.setCustomValidity("Please choose a row that is visible. Some rows are hidden depending on the filters you set.");
        } else {
            this.setCustomValidity("");
            var offset = row.offset(),
                hControls = $(".controls").outerHeight();

            $("html, body").stop().animate({
                scrollTop: offset.top - hControls
            });
        }
    });

    $(".controls form").submit(function(e) {e.preventDefault();});

    $(".controls [name='filter-components']").change(function() {
        $(this).parent().toggleClass("active");
    });

    $(document).click(function(e) {
        if ($(".controls [for='filter-components']").hasClass("active")) {
            var target = $(e.target);
            if (!target.closest(".filter-wrapper, .controls [for='filter-components']").length) {
                $(".controls [for='filter-components']").removeClass("active");
            }
        }
    });

    $(".filter-wrapper [type='checkbox']").change(function() {
        var $this = $(this),
            component = $this.val();

        if ($this.is("[name='component']")) {
            if ($this.is(":checked")) {
                $(".results-wrapper tbody:not(.empty) tr[data-component='" + component + "']").show();
            } else {
                $(".results-wrapper tbody:not(.empty) tr[data-component='" + component + "']").hide();
            }

            if (!$this.closest(".filter-wrapper").find("[name='component']").addBack().is(":checked")) {
                $(".results-wrapper .empty").css("display", "table-row-group");
                $("#all-components").prop("checked", false).parent().removeClass("active");
                $("[for='go-to']").addClass("disabled").children("input").prop("disabled", true);
            } else {
                if ($(".filter-wrapper [name='component']:not([disabled])").length == $(".filter-wrapper [name='component']:not([disabled]):checked").length) {
                    $("#all-components").prop("checked", true).parent().addClass("active");
                }
                else {
                    $("#all-components").prop("checked", false).parent().removeClass("active");
                }
                $(".results-wrapper .empty").hide();
                $("[for='go-to']").removeClass("disabled").children("input").prop("disabled", false);
            }
        } else if ($this.is("#all-components")) {
            $this.parent().toggleClass("active");
            $(".filter-wrapper [type='checkbox'][name='component']:not([disabled])").prop("checked", $this.is(":checked")).change();
        }

        $("#go-to").val($(".results-wrapper tbody:not(.empty) tr:visible").first().attr("data-result-id") || "--");
    });

    function disableAndEnableInputs() {
        $("[for='go-to'], [for='filter-components'], .filter-wrapper label").removeClass("disabled").children("input").prop("disabled", false);

        // Disable the checkboxes which don't have any results
        $(".filter-wrapper [type='checkbox'][name='component']").each(function() {
            var $this = $(this),
                component = $this.val();

            if ($(".results-wrapper tbody:not(.empty) tr[data-component='" + component + "']").length == 0) {
                $this.prop("disabled", true);
                $this.prop("checked", false);
                $this.parent("label").addClass("disabled");
            }
        });
    }

    var controls = $(".controls"),
        top = controls[0].getBoundingClientRect().top + controls.scrollTop(),
        h = controls[0].getBoundingClientRect().height,
        dummy = $(".dummy-controls");

    dummy.height(h);

    $(window).resize($.throttle(250, setDummyVariables));
    $(window).scroll($.throttle(250, scrollMenu));

    function setDummyVariables() {
        if (!controls.hasClass("scroll")) {
            top = controls.offset().top;
            h = controls.outerHeight();
            dummy.height(h);
        } else {
            top = dummy.offset().top;
        }
    }

    function scrollMenu() {
        var $this = $(window);

        if ($this.scrollTop() >= top) {
            dummy.show();
            controls.addClass("scroll");
        } else {
            dummy.hide();
            controls.removeClass("scroll");
        }
    }

    /* Tree visualizer */
    $(".results-wrapper tbody:not(.empty)").on("click", "a.tv-show-fs", function(e) {
        var $this = $(this);
        $(".loading-wrapper.tv").addClass("active");
        window.history.replaceState("", document.title, window.location.pathname + $this.attr("href"));
        body.treeVisualizer($this.data("tv-url"), {
            normalView: false,
            initFSOnClick: true,
            fsFontSize: 12
        });
        e.preventDefault();
    });
});
