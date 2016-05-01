$(document).ready(function() {
    var hash = window.location.hash,
        tvLink = $("a.tv-show-fs"),
        resultID = 0,
        stop = false,
        searchBgCheck = $('[name="continue-bg"]'),
        done = false,
        xhrAllSentences;

    getSentences();



    if (hash) {
        if (hash.indexOf("tv-") == 1) {
            var index = hash.match(/\d+$/);
            tvLink.eq(index[0] - 1).click();
        }
    }

    function getSentences() {
        if (!done) {
            $(".loading-wrapper.searching").addClass("active");
            $.get(phpVars.fetchResultsPath, function(json) {
                if (!done) {
                    var data = $.parseJSON(json);
                    $(".results-wrapper tbody .added").removeClass("added");
                    if (data.data) {
                        $.each(data.data, function(id, value) {
                            if (!done) {
                                resultID++;
                                var link = value[0];

                                link = link.replace(/\bhref=\"([^"]+)\"/, "href=\"#tv-" + resultID + "\" data-tv-url=\"$1\"");

                                $(".results-wrapper tbody").append('<tr class="added"><td>' + link + '</td><td>' +
                                    value[1] + '</td></tr>');
                            }
                        });
                        $(".results-wrapper").fadeIn("fast");
                        resultIDString = numericSeparator(resultID);

                        $(".count strong").text(resultIDString);
                        if (!stop) {
                            setTimeout(getSentences, 150);
                        }

                    } else {
                        $(".loading-wrapper.searching").removeClass("active");
                        $(".results-wrapper tbody .added").removeClass("added");
                        $(".messages").addClass("active");
                        if (data.error) {
                            $(".controls").remove();
                            $(".error p").text("Error! " + data.error_msg);
                            $(".error").addClass("active");
                        } else if ($(".results-wrapper tbody").children().length == 0) {
                            $(".controls").remove();
                            $(".error p").text("No results found!");
                            $(".error").addClass("active");
                        } else {
                            $(".notice p").text("All results have been found!");
                            $(".controls").find("button:not([name='to-top']), input").prop("disabled", true);
                            $(".controls").find("label").addClass("disabled");
                            $(".notice").addClass("active");
                            $(".count strong + span").text($(".count strong").text());
                        }
                        done = true;
                        $(".stop").click();
                        if (xhrAllSentences) xhrAllSentences.abort();
                    }
                }

                if (resultID = 10) {
                  findAll();
                }
            });
        }
    }

    $.get(phpVars.fetchCountsPath, function(count) {
        if (count && !done) {
            count = numericSeparator(count);
            $(".count strong + span").text(count);
        }
    });

    function numericSeparator(integer) {
        return integer.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }

    function findAll() {
      xhrAllSentences = $.ajax({
          url: phpVars.getAllResultsPath,
          success: function(json) {
              var data = $.parseJSON(json);
              $(".results-wrapper tbody .added").removeClass("added");
              done = true;
              if (data.data) {
                  var i = 0;
                  $(".results-wrapper tbody").empty();

                  $(".loading-wrapper.searching").removeClass("active");
                  $(".messages").addClass("active");

                  $.each(data.data, function(id, value) {
                      i++;
                      var link = value[0];
                      link = link.replace(/\bhref=\"([^"]+)\"/, "href=\"#tv-" + i + "\" data-tv-url=\"$1\"");

                      $(".results-wrapper tbody").append('<tr><td>' + link + '</td><td>' +
                          value[1] + '</td></tr>');
                  });
                  $(".results-wrapper").fadeIn("fast");
                  resultIDString = numericSeparator(i);
                  $(".count strong + span, .count strong").text(resultIDString);

                  $(".notice p").text("All results have been found!");
                  $(".controls").find("button:not([name='to-top']), input").prop("disabled", true);
                  $(".controls").find("label").addClass("disabled");
                  $(".notice").addClass("active");
              } else {
                  $(".loading-wrapper.searching").removeClass("active");
                  $(".messages").addClass("active");
                  if (data.error) {
                      $(".controls").remove();
                      $(".error p").text("Error! " + data.error_msg);
                      $(".error").addClass("active");
                  } else if ($(".results-wrapper tbody").children().length == 0) {
                      $(".controls").remove();
                      $(".error p").text("No results found!");
                      $(".error").addClass("active");
                  }
              }
          }
      });
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

    $(".results-wrapper tbody").on("click", "a.tv-show-fs", function(e) {
        var $this = $(this);
        $(".loading-wrapper.tv").addClass("active");
        window.history.replaceState("", document.title, window.location.pathname + $this.attr("href"));
        body.treeVisualizer($this.data("tv-url"), {
            normalView: false,
            initFSOnClick: true
        });
        e.preventDefault();
    });

    $("[name='to-top']").click(function() {
        $("html, body").animate({
            scrollTop: 0
        });
    });

    var controls = $(".controls"),
        top = controls[0].getBoundingClientRect().top + controls.scrollTop(),
        h = controls[0].getBoundingClientRect().height,
        dummy = $(".dummy-controls");

    dummy.height(h);

    $(window).resize($.throttle(250, setDummyVariables));
    $(window).scroll($.throttle(250, scrollMenu));
    $(window).focus(function() {
        if (!searchBgCheck.is(":checked")) $(".continue").click()
    }).blur(function() {
        if (!searchBgCheck.is(":checked")) $(".stop").click();
    });

    function setDummyVariables() {
        if (!controls.hasClass("scroll")) {
            top = controls[0].getBoundingClientRect().top + controls.scrollTop();
            h = controls[0].getBoundingClientRect().height;
            dummy.height(h);
        }
    }

    function scrollMenu() {
        var $this = $(window);

        if ($this.scrollTop() >= top) {
            dummy.addClass("active");
            controls.addClass("scroll");
        } else {
            dummy.removeClass("active");
            controls.removeClass("scroll");
        }
    }
});
