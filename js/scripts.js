$(document).ready(function() {
    body = $("body");
    /*******/
    /* EBS */
    /*******/
    // STEP 1: input.php
    if (body.hasClass("ebs")) {
        if (body.hasClass("step-1")) {
            $('[name="clear"]').click(function() {
                $(this).prev('[name="input"]').val("").focus();
            });
            taalPortaalFiller();
        }
        // STEP 3: matrix.php
        else if (body.hasClass("step-3") || body.hasClass("step-6")) {
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
                // Initialisation code dataTables
                $('#example').dataTable({
                    "sScrollY": "400px",
                    "bPaginate": false
                });

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
        } else if (body.hasClass("step-4")) {
            $("[type='checkbox'][data-check^='all']").change(function() {
                var $this = $(this),
                    checked = $this.prop("checked")
                if ($this.is("[data-check='all-cgn-vl']")) {
                    $(".cgn label:not(.disabled) [value^='v']").prop("checked", checked);
                } else if ($this.is("[data-check='all-cgn-nl']")) {
                    $(".cgn label:not(.disabled) [value^='n']").prop("checked", checked);
                }
                else {
                    $(".lassy label:not(.disabled) [type='checkbox']").prop("checked", checked);
                }
            })

            $("[name='treebank']").change(function() {
                var val = $(this).val();
                $(".cgn, .lassy, .sonar").hide();
                $(".cgn, .lassy, .sonar").find("[type='checkbox'], [type='radio']").prop("disabled", true);
                $("." + val).show().find("label:not(.disabled)").find("[type='checkbox'], [type='radio']").prop("disabled", false);
            });

            if (treebank) {
                $("[value='"+treebank+"']").click();
            }
            else {
                $("[value='lassy']").click();
            }
        }
    }
});
