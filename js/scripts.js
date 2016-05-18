$(document).ready(function() {
    body = $("body");

    $(window).resize($.throttle(250, mobileMenu)).resize();

    function mobileMenu() {
        if ($(window).width() < 721) {
            $(".primary-navigation").addClass("small");
            $(".primary-navigation button").addClass("active").removeAttr("hidden");
        } else {
            $(".primary-navigation").removeClass("active small");
            $(".primary-navigation button").removeClass("active").attr("hidden", "hidden");
        }
    }

    $(".primary-navigation button").click(function() {
        $(".primary-navigation").toggleClass("active");
    });

    $(document).click(function(e) {
        var target = $(e.target);
        if ($(".primary-navigation").hasClass("active")) {
            if (!target.closest(".primary-navigation button, .primary-navigation ul").length) {
                $(".primary-navigation").removeClass("active");
            }
        }
    });

    if (body.hasClass("step-1")) {
        $('[name="clear"]').click(function(e) {
            $(this).prev('[name="input"], textarea').val("").removeClass("has-content").focus();
            e.preventDefault();
        });

        $('[name="input"]').keyup(function() {
            if ($(this).val()) $(this).addClass("has-content");
            else $(this).removeClass("has-content");
        }).keyup();

        taalPortaalFiller();
    }
    // STEP 3: matrix.php
    else if (body.hasClass("ebs") && (body.hasClass("step-3") || body.hasClass("step-6"))) {
        // Specific implementation of the Tree Visualizer plugin for GrETEL:
        // allows refreshing of page, opening tree in new window and so on
        var tvLink = $("a.tv-show-fs");

        tvLink.each(function(index) {
            $(this).attr("data-tv-url", $(this).attr("href"));
            $(this).attr("href", "#tv-" + (index + 1));
        });
        $("a.tv-show-fs").click(function(e) {
            var $this = $(this);
            $(".loading-wrapper").addClass("active");
            window.history.replaceState("", document.title, window.location.pathname + $this.attr("href"));
            body.treeVisualizer($this.data("tv-url"), {
                normalView: false,
                initFSOnClick: true
            });
            e.preventDefault();
        });
        var hash = window.location.hash;
        if (hash) {
            if (hash.indexOf("tv-") == 1) {
                var index = hash.match(/\d+$/);
                tvLink.eq(index[0] - 1).click();
            }
        }

        if (body.hasClass("step-6")) {
            // Show and hide required elements
            $(".slidingDiv").hide();
            $(".show_hide").show();
            $("#hide").hide(); // hide message 'hide'
            $("#show").show(); // show message 'show'

            $('.show_hide').click(function() {
                $(".slidingDiv").slideToggle();
                $("#show").toggle();
                $("#hide").toggle();
            });
        }
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
                console.log("not check-all");

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
