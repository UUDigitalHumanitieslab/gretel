$(document).ready(function() {
    var body = $("body"),
        nav1 = $(".primary-navigation"),
        $window = $(window),
        $document = $(document);

    $("#old-ie-script").remove();

    $window.resize($.throttle(250, mobileMenu)).resize();

    $("[name='to-top']").click(function() {
        $("html, body").animate({
            scrollTop: 0
        });
    });

    function mobileMenu() {
        if ($window.width() < 721) {
            nav1.addClass("small");
            nav1.find("button").addClass("active").prop("hidden", false);
        } else {
            nav1.removeClass("active small");
            nav1.find("button").removeClass("active").prop("hidden", true);
        }
    }

    nav1.find("button").click(function() {
        nav1.toggleClass("active");
    });

    $document.click(function(e) {
        var target = $(e.target);
        if (nav1.hasClass("active")) {
            if (!target.closest(nav1.find("button"), nav1.find("ul")).length) {
                nav1.removeClass("active");
            }
        }
    });

    if (body.hasClass("step-1")) {
        var clearBtn = $("[name='clear']");
        clearBtn.click(function(e) {
            var $this = $(this);
            $this.prev("[name='input'], textarea").val("").addClass("no-content").focus();
            $this.prop("disabled", true);
            // Prevent form submission / page reload
            e.preventDefault();
        });

        $("[name='input'], textarea").keyup(function() {
            var $this = $(this);
            if ($this.val()) {
                $this.removeClass("no-content");
                clearBtn.prop("disabled", false);
            } else {
                $this.addClass("no-content");
                clearBtn.prop("disabled", true);
            }
        }).keyup();

        taalPortaalFiller();

        if (body.hasClass("xps")) {
            var input = $("[name='xpath']");
            // Check whether the XPath has the same amount of opening and closing tags
            // If not, throw custom validation error message
            $("[type='submit']").click(function() {
                var openBrackets = (input.val().match(/\[/g) || "").length,
                    closeBrackets = (input.val().match(/\]/g) || "").length;
                if (openBrackets == closeBrackets) {
                    input[0].setCustomValidity("");
                } else {
                    if (openBrackets > closeBrackets) {
                        input[0].setCustomValidity("Fix XPath inconsistency: missing ] or unnecessary [ (x" + (openBrackets - closeBrackets) + ")");
                    }
                    if (openBrackets < closeBrackets) {
                        input[0].setCustomValidity("Fix XPath inconsistency: missing [ or unnecessary ] (x" + (closeBrackets - openBrackets) + ")");
                    }
                }
            });

            input.keyup(function() {
                this.setCustomValidity("");
            });
        }
    } else if (body.hasClass("matrix")) {
        // Allow cell clicks to go down to the inputs, but prevent clicks on the input
        // going up. Otherwise, we'll get stuck in an infinite loop
        $("tbody td").click(function() {
            $(this).find("input").click();
        }).find("input").click(function(e) {
            e.stopPropagation();
        });

        $(".table-wrapper .case-sensitive input[type='checkbox']").each(function(i, el) {
          var $el = $(el);
          if ($el.is(":checked")) {
            $el.prop("disabled", false).parent("td").removeClass("disabled");
          }
        })


        // Enable disable the option for case-sensitivity
        $(".table-wrapper input[type='radio']").click(function() {
          var $this = $(this),
            val = $this.val(),
            i = $this.parent("td").index(),
            checkCell = $(".table-wrapper .case-sensitive td:nth-child("+(i+1)+")")

          if (val == "token") {
            checkCell.removeClass("disabled").children("input[type='checkbox']").prop("disabled", false);
          }
          else {
            checkCell.addClass("disabled").children("input[type='checkbox']").prop("checked", false).prop("disabled", true);
          }
        });
    } else if ((body.hasClass("ebs") && body.hasClass("step-4")) || (body.hasClass("xps") && body.hasClass("step-2"))) {
        // Main treebank selection (CGN, Lassy, SONAR)
        $("[type='radio']").change(function() {
            var $this = $(this),
                value = $this.val();
            if ($this.is("[name='treebank']")) {
                $(".cgn, .lassy, .sonar").hide();
                $(".cgn, .lassy, .sonar").find("[type='checkbox'], [type='radio']").prop("disabled", true);
                $("." + value).show().find("label:not(.disabled)").find("[type='checkbox'], [type='radio']").prop("disabled", false);
            }
        });
        // Selecting subtreebanks
        $("[type='checkbox']").change(function() {
            var $this = $(this);

            // If this is not a check-all checkbox
            if (!$this.is("[data-check^='all']")) {

                // For subtreebanks with checkboxes (Lassy and CGN only, they have checkboxes)
                if ($this.is("[name='subtreebank[]']")) {
                    var checkboxAll,
                        treebank = $this.attr("data-treebank"),
                        tableWrapper = $this.closest(".table-wrapper"),
                        value = $this.val(),
                        valStartsWith = value.substring(0, 1);

                    if (valStartsWith == "n") {
                        checkboxAll = tableWrapper.find("[data-check='all-cgn-nl']");
                    } else if (valStartsWith == "v") {
                        checkboxAll = tableWrapper.find("[data-check='all-cgn-vl']");
                    } else {
                        checkboxAll = tableWrapper.find("[data-check='all-lassy']");
                    }

                    var subtreebanks = tableWrapper.find("[name='subtreebank[]']"),
                        cgnValueString = (treebank == 'cgn') ? "[value^='" + valStartsWith + "']" : "";

                    // If all component checkboxes are checked
                    if (subtreebanks.filter(cgnValueString + ":not(:disabled)").length == subtreebanks.filter(cgnValueString + ":not(:disabled):checked").length) {
                        checkboxAll.prop("indeterminate", false);
                        checkboxAll.prop("checked", true);
                    }
                    // If no checkboxes are checked
                    else if (subtreebanks.filter(cgnValueString + ":checked").length == 0) {
                        checkboxAll.prop("indeterminate", false);
                        checkboxAll.prop("checked", false);
                    }
                    // In all other cases (i.e. some checked some not checked)
                    else {
                        checkboxAll.prop("indeterminate", true);
                    }
                }
            }
            // If this is a check-all checkbox
            else {
                var checked = $this.prop("checked");

                if ($this.is("[data-check='all-cgn-vl']")) {
                    $(".cgn label:not(.disabled) [type='checkbox'][value^='v']").prop("checked", checked);
                } else if ($this.is("[data-check='all-cgn-nl']")) {
                    $(".cgn label:not(.disabled) [type='checkbox'][value^='n']").prop("checked", checked);
                } else {
                    $(".lassy label:not(.disabled) [type='checkbox']").prop("checked", checked);
                }
            }
        });

        // On document ready, set active treebank (from cache or not)
        if ($("[type='radio'][name='treebank']:checked").length == 0) {
            $("[type='radio'][name='treebank'][value='lassy']").click().change();
        } else {
            $("[type='radio'][name='treebank']:checked").click().change();
        }
    }



});
