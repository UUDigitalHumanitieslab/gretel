$(document).ready(function() {
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

    if (hash) {
        if (hash.indexOf("tv-") == 1) {
            var index = hash.match(/\d+$/);
            tvLink.eq(index[0] - 1).click();
        }
    }

    function getSentences() {
        if (!done && (resultID <= phpVars.resultsLimit)) {
            $(".loading-wrapper.searching").addClass("active");
            $.ajax(phpVars.fetchResultsPath)
                .done(function(json) {
                    if (!done) {
                        var data = $.parseJSON(json);
                        $(".results-wrapper tbody .added").removeClass("added");
                        if (data.data) {
                            loopResults(data.data, false);
                        } else {
                            $(".loading-wrapper.searching").removeClass("active");
                            $(".results-wrapper tbody .added").removeClass("added");
                            $(".messages").addClass("active");
                            if (data.error) {
                                messageOnError(data.error_msg)
                            } else if ($(".results-wrapper tbody").children().length == 0) {
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
                    var string = "An error occurred: " + error + ".";
                    messageOnError(string);
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
            $(".results-wrapper tbody .added").removeClass("added");
            if (data.data) {
                loopResults(data.data, true);
                messageAllResultsFound();

                $(".stop").click();
                clearTimeout(findAllTimeout);
            } else {
                $(".loading-wrapper.searching").removeClass("active");
                $(".messages").addClass("active");
                if (data.error) {
                    messageOnError(data.error_msg);
                } else if ($(".results-wrapper tbody").children().length == 0) {
                    messageNoResultsFound();
                }
            }
        })
        .fail(function(jqXHR, textStatus, error) {
            var string = "An error occurred: " + error + ".";
            messageOnError(string);
        })
        .always(function() {
            done = true;
            $(".stop").click();
        });
    }

    setTimeout(function() {
        $.get(phpVars.fetchCountsPath, function(count) {
            if (count) {
                $(".notice span small").remove();
                resultsCount = numericSeparator(count);
                $(".count strong + span").text(resultsCount);
                $(".notice span").text(resultsCount);

                doneCounting = true;
            }
        });
    }, timeoutBeforeCount);

    function numericSeparator(integer) {
        return integer.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    function messageAllResultsFound() {
        $(".loading-wrapper.searching").removeClass("active");
        $(".controls").find(".stop, .continue").prop("disabled", true);
        disableAndEnableInputs();
        var stringCount = doneCounting ? [resultsCount, ''] : ['--', '<small>(still counting)</small>'];
        notice = '<span>' + stringCount[0] + '</span> result(s) have/has been found! ' + stringCount[1];
        if (resultID >= phpVars.resultsLimit) {
            notice += '<br>We have restricted the output to 500 hits. ' +
            'You can find the reason for this <a href="'+ phpVars.fetchHomePath +'/documentation.php#faq-1" ' +
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

            $(".results-wrapper tbody").empty();
            $(".loading-wrapper.searching").removeClass("active");
        }
        $.each(sentences, function(id, value) {
            if (returnAllResults || (!returnAllResults && !done)) {
                resultID++;
                var link = value[0];
                link = link.replace(/\bhref=\"([^"]+)\"/, "href=\"#tv-" + resultID + "\" data-tv-url=\"$1\"");
                var treebank = link.match(/(?:&tb=)([^&"=]+)/)[1],
                    linkText = link.match(/(?:>)([^<>]+)(?:<\/a>)/)[1],
                    component = '',
                    componentString = '';

                if (treebank == "lassy") {
                    component = linkText.match(/([^<>]+?)(?:-\d+(?:-|\.).*)/)[1];
                    component = component.replace(/^((?:[a-zA-Z]{3,4})|(?:WR(?:-[a-zA-Z]){3}))-.*/, '$1');

                    componentString = component.replace(/-/g, '');
                    componentString = componentString.slice(0, 4);
                }
                else if (treebank == "cgn") {
                    component = linkText.match(/([^<>\d]+)/)[1];
                    component = component.slice(1);

                    componentString = component.replace(/-/g, '');
                }

                component = component.toUpperCase();
                componentString  = componentString.toUpperCase();

                $(".results-wrapper tbody").append('<tr data-result-id="'+resultID+'" data-component="'+componentString+'">' +
                '<td>'+resultID+'</td><td>'+link+'</td><td>' +
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

    $(".controls [name='go-to']").change(function() {
        var val = $(this).val(),
            offset = $("tr[data-result-id='"+val+"']").offset(),
            hControls = $(".controls").outerHeight();

            $("html, body").stop().animate({
                scrollTop: offset.top - hControls
            });
    });

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
            component = $(this).attr("name");

        $(".results-wrapper tbody tr.empty").remove();
        if ($this.is(":checked")) {
            $(".results-wrapper tbody tr[data-component='"+component+"']").show();
        } else {
            $(".results-wrapper tbody tr[data-component='"+component+"']").hide();
        }
        if(!$this.siblings().addBack().is(":checked")) {
            $(".results-wrapper tbody").append('<tr class="empty"><td colspan="4">No results for the filters you specified.</td></tr>');
        }
    });

    function disableAndEnableInputs() {
        $("[for='go-to'], [for='filter-components'], .filter-wrapper label").removeClass("disabled").children("input").prop("disabled", false);
        $("#go-to").attr("max", resultID);

        // Disable the checkboxes which don't have any results
        $(".filter-wrapper [type='checkbox']").each(function() {
            var component = $(this).attr("name"),
                $this = $(this);

            if ($(".results-wrapper tbody tr[data-component='"+component+"']").length == 0) {
                $this.prop("disabled", true);
                $this.prop("checked", false);
                $this.parent("label").addClass("disabled");
            }
        });

        console.log("called");
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
        }
        else {
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
    $(".results-wrapper tbody").on("click", "a.tv-show-fs", function(e) {
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
