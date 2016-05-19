/**
 * Documentation loosely based on the JSDoc standard
 */
$(document).ready(function() {
    // Customizable attributes!
    // Specify how long it should take for functions to session
    // * Before counting ALL hits, independent of current fetched results (ms)
    // * Before ALL results are being gathered on the background (ms), OR
    // * Amount of hits before ALL results are being gathered (hits)
    var timeoutBeforeCount = 500,
        timeoutBeforeMore = 700,
        xResultsBeforeMore = 4;

    var hash = window.location.hash,
        $window = $(window),
        tvLink = $("a.tv-show-fs"),
        controls = $(".controls"),
        resultsWrapper = $(".results-wrapper"),
        filterWrapper = $(".filter-wrapper"),
        controls = $(".controls"),
        dummy = $(".dummy-controls");

    var xhrAllSentences,
        resultID = 0,
        resultsCount = 0,
        stop = false,
        done = false,
        doneCounting = false;

    getSentences();

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
                    // Edge triggers a fail when an XHR request is aborted
                    // We don't want that, so if the error message is abort, ignore
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
        var stringCount = doneCounting ? [resultsCount, ''] : ['--', '<small>(still counting, can take a while)</small>'];
        notice = '<strong>' + stringCount[0] + '</strong> result(s) have/has been found! ' + stringCount[1];
        if (resultID >= phpVars.resultsLimit) {
            notice += '<p>We have restricted the output to 500 hits. ' +
                'You can find the reason for this <a href="' + phpVars.fetchHomePath + '/documentation.php#faq-1" ' +
                'title="Why is the output limited to 500 sentences?" target="_blank">in our FAQ</a>.</p>';
        }
        notice += '<br><p>You can download a tab-separated file <a href="'+phpVars.downloadPath + '"' +
            'title="Download results" target="_blank" download="gretel-results.txt">here</a>.';
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

    $(".controls [name='go-to']").keyup(function(e){
        var keycode = e.keyCode,
        $this = $(this);
        // Reset customValidity on backspace or delete keys, or up and down arrows
        // Additionally allow a user to move throguh rows by using up and down arrows in
        // the input field
        if (keycode == 8 || keycode == 46 || keycode == 38 || keycode == 40) {
            this.setCustomValidity("");
            // UP arrow
            if (keycode == 38 && $this.val() < resultID) $this.val(parseInt($this.val(), 10)+1).change();
            // DOWN arrow
            if (keycode == 40 && $this.val() > 1) $this.val(parseInt($this.val(), 10)-1).change();
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

        $("#all-components").prop("indeterminate", false);

        if ($this.is("[name='component']")) {
            // Show/hide designated components in results
            if ($this.is(":checked")) {
                resultsWrapper.find("tbody:not(.empty) tr[data-component='" + component + "']").show();
            } else {
                resultsWrapper.find("tbody:not(.empty) tr[data-component='" + component + "']").hide();
            }

            // If none of the component checkboxes are checked
            if (!filterWrapper.find("[name='component']").is(":checked")) {
                resultsWrapper.find(".empty").css("display", "table-row-group");
                filterWrapper.find("#all-components").prop("checked", false).parent().removeClass("active");
                $("[for='go-to']").addClass("disabled").children("input").prop("disabled", true);
            } else {
                if (filterWrapper.find("[name='component']:not(:disabled)").length == filterWrapper.find("[name='component']:not(:disabled):checked").length) {
                    filterWrapper.find("#all-components").prop("checked", true).parent().addClass("active");
                }
                else {
                    filterWrapper.find("#all-components").prop("checked", false).prop("indeterminate", true).parent().removeClass("active");
                }
                resultsWrapper.find(".empty").hide();
                $("[for='go-to']").removeClass("disabled").children("input").prop("disabled", false);
            }
        }
        // One checkbox to rule them all
        else if ($this.is("#all-components")) {
            $this.parent().toggleClass("active");
            filterWrapper.find("[type='checkbox'][name='component']:not(:disabled)").prop("checked", $this.is(":checked")).change();
        }

        $("#go-to").val(resultsWrapper.find("tbody:not(.empty) tr:visible").first().attr("data-result-id") || "--");
    });

    function disableAndEnableInputs() {
        $("[for='go-to'], [for='filter-components'], .filter-wrapper label").removeClass("disabled").children("input").prop("disabled", false);

        // Disable the checkboxes which don't have any results
        filterWrapper.find("[type='checkbox'][name='component']").each(function() {
            var $this = $(this),
                component = $this.val();

            if (resultsWrapper.find("tbody:not(.empty) tr[data-component='" + component + "']").length == 0) {
                $this.prop("disabled", true);
                $this.prop("checked", false);
                $this.parent("label").addClass("disabled");
            }
        });
    }

    var controlsTop = controls[0].getBoundingClientRect().top + controls.scrollTop(),
        controlsHeight = controls[0].getBoundingClientRect().height;

    dummy.height(controlsHeight);

    $window.resize($.throttle(250, setDummyVariables));
    $window.scroll($.throttle(250, scrollMenu));

    function setDummyVariables() {
        if (!controls.hasClass("scroll")) {
            controlsTop = controls.offset().top;
            controlsHeight = controls.outerHeight();
            dummy.height(controlsHeight);
        } else {
            controlsTop = dummy.offset().top;
        }
    }

    function scrollMenu() {
        if ($window.scrollTop() >= controlsTop) {
            dummy.show();
            controls.addClass("scroll");
        } else {
            dummy.hide();
            controls.removeClass("scroll");
        }
    }

    /* Tree visualizer */
    resultsWrapper.find("tbody:not(.empty)").on("click", "a.tv-show-fs", function(e) {
        var $this = $(this);
        $(".loading-wrapper.tv").addClass("active");
        $("body").treeVisualizer($this.data("tv-url"), {
            normalView: false,
            initFSOnClick: true,
            fsFontSize: 12
        });
        e.preventDefault();
    });
});
