/**
 * jQuery "plug-in" to convert an XML tree structure into a
 * plug-and-play HTML tree that allows user interaction.
 *
 * https://github.com/BramVanroy/tree-visualizer
 *
 * @version 0.3
 * @license MIT
 * @author Bram Vanroy
 */

(function($) {
    $.fn.treeVisualizer = function(xml, options) {
        var defaults = {
            normalView: true,
            sentence: '',
            initFSOnClick: false,
            extendedPOS: false,
            hasNavigation: false
        };
        var args = $.extend({}, defaults, options);
        var instance = this,
            FS, NS,
            treeFS, treeNS, tooltipFS, tooltipNS,
            anyTree,
            anyTooltip,
            zoomOpts, tooltipTimeout;
        var $window = $(window),
            $body = $("body");
        var initTrees = 0;

        initVars();
        loadXML(xml);
        navigationDisabler();
        // Window event only need to be bound once
        $window.on("scroll", function() {
            tooltipPosition();
        });

        function bindInitEvents() {
            if (!args.initFSOnClick) {
                // Show tree-visualizer-fs tree
                instance.find(".tv-show-fs").on("click", function(e) {
                    anyTooltip.css("top", "-100%").children("ul").empty();
                    if (typeof treeNS != "undefined") treeNS.find("a").removeClass("hovered");
                    $body.addClass("tv-fs-open");
                    FS.fadeIn(250, function() {
                        if (!FS.children("ol").is("[data-tv-fontsize]")) {
                            fontToFit();
                        }
                    });

                    e.preventDefault();
                });
            }
            // Adjust scroll position
            anyTree.on("scroll", function() {
                tooltipPosition();
            });

            // Close fullscreen if a user clicks on an empty area
            FS.on("click", function(e) {
                var target = $(e.target);
                if (!target.closest(".tv-error, .tv-content-wrapper").length) {
                    $body.removeClass("tv-fs-open");
                    FS.fadeOut(250, function() {
                        treeFS.find("a").removeClass("hovered");
                        removeError();
                    });
                    if (args.initFSOnClick) history.replaceState("", document.title, window.location.pathname + window.location.search);
                }
            });
            // Zooming
            zoomOpts.find("button").on("click", function() {
                var $this = $(this);
                if ($this.is(".tv-close-fs")) {
                    $body.removeClass("tv-fs-open");
                    FS.fadeOut(250, function() {
                        treeFS.find("a").removeClass("hovered");
                        removeError();
                    });
                    if (args.initFSOnClick) history.replaceState("", document.title, window.location.pathname + window.location.search);
                } else {
                    clearTimeout(tooltipTimeout);
                    fontSizeTreeFS($this.attr("class").match(/\b(zoom-[^\s]+)\b/)[0]);

                    var animationSpeed = treeFS.find("a.hovered").css("transition-duration") || 200;
                    animationSpeed = (String(animationSpeed).indexOf("ms") > -1) ? parseFloat(animationSpeed) : (parseFloat(animationSpeed) * 1000);
                    animationSpeed += 50;

                    tooltipTimeout = setTimeout(function() {
                        tooltipPosition(true);
                    }, animationSpeed);
                }
            });

            FS.find(".tv-navigation-wrapper button").on("click", function() {

                var index = FS.attr("data-tv-active-index"),
                    resultsTable = $(".results-ajax-wrapper tbody:not(.empty)");

                treeFS.find("a").removeClass("hovered");
                tooltipFS.hide();

                if ($(this).is(".tv-prev-tree")) {
                    if (index > 0) index--;
                } else {
                    if (index < resultsTable.find("tr").length - 1) index++;
                }


                navigationDisabler();

                resultsTable.find("tr").eq(index).find("a").click();
            });

            anyTree.on("click", "a", function(e) {
                if (!$(this).hasClass("ignored")) {
                    var $this = $(this),
                        data = $this.parent("li").data(),
                        tree = $this.closest(".tv-tree"),
                        tooltipList = tree.next(".tv-tooltip").children("ul"),
                        i;

                    tooltipList.empty();
                    tree.find("a").removeClass("hovered");
                    $this.addClass("hovered");

                    for (i in data) {
                        if (data.hasOwnProperty(i)) {
                            $("<li>", {
                                html: "<strong>" + i + "</strong>: " + data[i]
                            }).prependTo(tooltipList);
                        }
                    }
                    tooltipPosition();
                }

                e.preventDefault();
            });

            anyTree.on("mouseout", "a.hovered", function() {
                if ($(this).closest(".tv-tree").hasClass("small")) {
                    $(this).on("transitionend", function() {
                        tooltipPosition(true);
                    });
                }
            });

            anyTooltip.children("button").on("click", function() {
                var tooltip = $(this).parent(".tv-tooltip");
                tooltip.fadeOut(250);
                tooltip.prev(".tv-tree").find("a").removeClass("hovered");
            });
        }

        function navigationDisabler() {
            FS.find(".tv-navigation-wrapper button").prop("disabled", false);
            var index = FS.attr("data-tv-active-index");
            if (index <= 0) {
                FS.find(".tv-navigation-wrapper .tv-prev-tree").prop("disabled", true);
            } else if (index >= $(".results-ajax-wrapper tbody:not(.empty)").find("tr").length - 1) {
                FS.find(".tv-navigation-wrapper .tv-next-tree").prop("disabled", true);
            }
        }

        function initVars() {
            var trees = [],
                tooltips = [],
                screens = [];

            if (args.normalView) {
                NS = instance.children("#tree-visualizer");

                treeNS = NS.find(".tv-tree");
                tooltipNS = treeNS.next(".tv-tooltip");

                screens.push(NS);
                trees.push(treeNS);
                tooltips.push(tooltipNS);
            }

            FS = instance.children("#tree-visualizer-fs");

            treeFS = FS.find(".tv-tree");
            tooltipFS = treeFS.next(".tv-tooltip");
            zoomOpts = FS.find(".tv-zoom-opts");

            zoomOpts.prev("a").attr('href', xml);

            screens.push(FS);
            trees.push(treeFS);
            tooltips.push(tooltipFS);

            anyTree = jqArrayToJqObject(trees);
            anyTooltip = jqArrayToJqObject(tooltips);
            anyView = jqArrayToJqObject(screens);

            errorContainer = anyView.children(".tv-error");

            if (args.sentence != "") {
                anyView.find(".tv-sentence-wrapper").addClass("has-sentence").children("span").html(args.sentence);
            }

            if (!args.hasNavigation) {
                FS.find(".tv-navigation-wrapper").hide();
            }
            anyView.find("*").off();
            bindInitEvents();
        }

        function loadXML(src) {
            $body.addClass("tv-is-loading");
            if (args.initFSOnClick) $body.addClass("tv-fs-open");
            var treeInitID = ++initTrees;
            $.ajax({
                    type: "GET",
                    url: src,
                    dataType: "xml",
                    cache: false
                })
                .done(function(data) {
                    if (data == null || data == undefined) {
                        $body.addClass("tv-fail").removeClass("tv-success");
                        errorHandle("Your XML appears to be empty or not in a compatible format.");
                    } else {
                        $body.addClass("tv-success").removeClass("tv-fail");
                        if (treeInitID == initTrees) parseXMLObj(data);

                    }
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    $body.addClass("tv-fail").removeClass("tv-success");
                    var msg = '';
                    if (jqXHR.status === 0) {
                        msg = 'Not connected to the Internet.<br>Verify your network connection.';
                    } else if (jqXHR.status == 404) {
                        msg = 'Requested XML file not found.<br>Try again with another query.';
                    } else if (jqXHR.status == 500) {
                        msg = 'Internal Server Error.<br>If the problem persists, contact us.';
                    } else {
                        msg = 'Something went wrong.<br>Please try again at another time.<br>';
                        msg += jqXHR.status + ' ' + textStatus + ' ' + errorThrown;
                    }
                    errorHandle(msg);
                })
                .always(function() {
                    if (treeInitID == initTrees) $body.removeClass("tv-is-loading");
                    if ($body.hasClass("tv-fail")) {
                        $(".continue-btn-wrapper [type='submit']").prop("disabled", true);
                    } else {
                        $(".continue-btn-wrapper [type='submit']").prop("disabled", false);
                    }
                    if (args.normalView) {
                        $body.addClass("tv-ns-open");
                    }
                    if (args.initFSOnClick) {
                        FS.fadeIn(250, function() {
                            fontToFit();
                        });
                    }
                });
        }

        function parseXMLObj(xml) {
            var xmlObject = $(xml);

            removeError();

            // See the buildOutputList function below
            anyTree.html(buildOutputList(xmlObject.find("node").first()));

            // Empty tooltips
            anyTooltip.children("ul").empty();
			
			// Add metadata
			var metadata = $("<table>");
			xmlObject.find("metadata").children("meta").sort(function(a, b) {
				return a.getAttribute("name").localeCompare(b.getAttribute("name"));
			}).each(function(i, e) {
				var meta = $("<tr>");
				
				var th = $("<th>");
				th.append(e.getAttribute("name"));
				meta.append(th);
				
				var td = $("<td>");
				td.append(e.getAttribute("value"));
				meta.append(td);
				
				metadata.append(meta);
			})
			$(document).tooltip({
				items: ".fa-commenting", 
				content: metadata
			});

            // Do some small tree modifications
            treeModifier();
        }

        // Build the HTML list output
        function buildOutputList(nodes) {
            var newList = $("<ol/>");

            nodes.each(function(x, e) {
                var newItem = $('<li><a href="#"></a></li>');

                for (var i = 0, l = e.attributes.length, a = null; i < l; i++) {
                    // Don't forget to add properties as data-attributes
                    a = e.attributes[i];
                    // Some data-attributes have initial spaces. Get rid of them
                    if (a.nodeName == "highlight") {
                        newItem.addClass("highlight");
                    } else if (a.nodeName == "not") {
                        newItem.addClass("excluded");
                    } else if (a.nodeName != "begin" && a.nodeName != "end") {
                        newItem.attr("data-" + a.nodeName, a.value.replace(/^\s(.+)/, "$1"));
                    }
                }
                if ($(this).children("node").length) {
                    newItem.append(buildOutputList($(this).children("node")));
                }
                newList.append(newItem);
            });
            return newList;
        }

        // Small modifications to the tree
        // Only add certain things (e.g. CS) on the matrix page
        function treeModifier() {
            anyTree.find("a").each(function() {
                var $this = $(this),
                    li = $this.parent("li");

                if ($body.hasClass("matrix") && li.data("word")) {
                    if (li.data("caseinsensitive")) {
                        li.data("word", li.data("word").toLowerCase());
                        li.data("lemma", li.data("lemma").toLowerCase());
                    } else {
                        $this.addClass("cs");
                    }
                }

                if (li.data("rel")) {
                    $this.append("<span class='rel'>" + li.data("rel") + "</span>");
                    if (li.data("index")) $this.append("<span class='index'>" + li.data("index") + "</span>");
                }

                if (li.data("postag") && args.extendedPOS) {
                    $this.append("<span class='postag'>" + li.data("postag") + "</span>");
                } else if (li.data("pt")) {
                    if (li.data("index")) $this.children("span:last-child").append(":" + li.data("pt"));
                    else $this.append("<span class='pt'>" + li.data("pt") + "</span>");
                } else if (li.data("cat")) {
                    if (li.data("cat") == " ") {
                        li.removeAttr("data-cat");
                        li.removeData("cat");
                        $this.addClass("ignored").text("?").attr("title", "Top node's properties will be ignored");
                    } else {
                        if (li.data("index")) $this.children("span:last-child").append(":" + li.data("cat"));
                        else $this.append("<span class='cat'>" + li.data("cat") + "</span>");
                    }
                }

                if ($this.is(":only-child")) {
                    if (li.data("lemma")) li.append("<span class='lemma'>" + li.data("lemma") + "</span>");
                    if (li.data("word")) {
                        var csTitle = ($body.hasClass("matrix") && !li.data("caseinsensitive")) ? ' title="Case sensitive word"' : '';
                        li.append("<span class='word'><em" + csTitle + ">" + li.data("word") + "</em></span>");
                    }
                    // addClass because after appending new children, it isn't necessarily the
                    // only child any longer
                    $this.addClass("only-child");
                }


                if (li.data("caseinsensitive")) {
                    li.removeAttr("data-caseinsensitive");
                    li.removeData("caseinsensitive");
                }
            });

            anyTree.find("li:only-child").addClass("only-child");
            anyTree.find("li:first-child").addClass("first-child");
            anyTree.find("li:last-child").addClass("last-child");
        }

        function noMoreZooming() {
            var currentFontSize = parseInt(treeFS.children("ol").css("fontSize"), 10),
                fitSize = treeFS.children("ol").attr("data-tv-fontsize");

            zoomOpts.find("button").prop("disabled", false);
            treeFS.removeClass("tv-small tv-x-small");

            if (currentFontSize <= 4) {
                zoomOpts.find("button.tv-zoom-out").prop("disabled", true);
                treeFS.children("ol").css("fontSize", "4px");
            } else if (currentFontSize >= 16) {
                zoomOpts.find("button.tv-zoom-in").prop("disabled", true);
            }

            if (currentFontSize == fitSize) {
                zoomOpts.find("button.tv-zoom-default").prop("disabled", true);
            }

            if (currentFontSize <= 8) {
                treeFS.addClass("tv-small");
                if (currentFontSize <= 4) {
                    treeFS.addClass("tv-x-small");
                }
            }
        }

        function fontSizeTreeFS(mode) {
            if (mode == 'zoom-default') {
                if (treeFS.children("ol").is("[data-tv-fontsize]")) {
                    treeFS.children("ol").css("fontSize", treeFS.children("ol").attr("data-tv-fontsize") + "px");
                } else {
                    fontToFit();
                }
            } else {
                var currentFontSize = parseInt(treeFS.children("ol").css("fontSize"), 10);
                if (mode == 'zoom-in') {
                    treeFS.children("ol").css("fontSize", currentFontSize + 2 + "px");
                } else if (mode == 'zoom-out') {
                    treeFS.children("ol").css("fontSize", currentFontSize - 2 + "px");
                }
            }
            noMoreZooming();
        }

        function fontToFit() {
            var fontFitSize = parseInt(treeFS.children("ol").css("fontSize"), 10),
                el = treeFS[0];

            while (fontFitSize > 4 && (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)) {
                fontFitSize--;
                treeFS.children("ol").css("fontSize", fontFitSize + "px");
            }

            while (fontFitSize < 16 && el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth) {
                fontFitSize++;
                treeFS.children("ol").css("fontSize", fontFitSize + "px");

                if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth) {
                    fontFitSize--;
                    treeFS.children("ol").css("fontSize", fontFitSize + "px");
                    break;
                }
            }
            treeFS.children("ol").attr("data-tv-fontsize", fontFitSize);
            noMoreZooming();
        }

        function tooltipPosition(animate) {
            var tree;
            if (typeof treeFS != "undefined" && $body.hasClass("tv-fs-open")) {
                tree = treeFS;
            } else if (typeof treeNS != "undefined" && $body.hasClass("tv-ns-open")) {
                tree = treeNS;
            }
            if (typeof tree != "undefined") {
                var targetLink = tree.find("a.hovered");
                if (targetLink.length) {
                    var tooltip = tree.next(".tv-tooltip"),
                        targetRect = targetLink[0].getBoundingClientRect(),
                        treeRect = tree[0].getBoundingClientRect(),
                        targetV = {
                            right: $window.outerWidth() - targetRect.right,
                            bottom: $window.outerHeight() - targetRect.bottom,
                        },
                        treeV = {
                            right: $window.outerWidth() - treeRect.right,
                            bottom: $window.outerHeight() - treeRect.bottom,
                        };

                    var tooltipV = {
                        left: parseInt(targetRect.left + (targetRect.width / 2) - (tooltip.outerWidth() / 2) + 8, 10) + "px",
                        top: parseInt(targetRect.top - tooltip.outerHeight() - 24, 10)
                    }

                    if (animate) {
                        tooltip.stop(true).animate({
                            "left": tooltipV.left,
                            "top": tooltipV.top
                        }, 250);
                    } else {
                        tooltip.css({
                            "left": tooltipV.left,
                            "top": tooltipV.top
                        });
                    }

                    if (((targetRect.left + (targetRect.width / 2)) < treeRect.left) ||
                        ((targetV.right + (targetRect.width / 2)) < treeV.right) ||
                        ((targetRect.top + (targetRect.height / 2)) < treeRect.top) ||
                        ((targetV.bottom + targetRect.height) < treeV.bottom)) {
                        tooltip.fadeOut(400);
                    } else {
                        tooltip.fadeIn(250);
                    }
                }
            }
        }

        function errorHandle(message) {
            errorContainer.children("p").html(message);
            if (args.normalView) {
                NS.children(".tv-show-fs").prop("disabled", true);
            }
        }

        function removeError() {
            if (args.normalView) {
                NS.children(".tv-show-fs").prop("disabled", false);
            }
        }

        function jqArrayToJqObject(arr) {
            //http://stackoverflow.com/a/11304274/2919731
            return $($.map(arr, function(el) {
                return el.get();
            }));
        }
    }
}(jQuery));
