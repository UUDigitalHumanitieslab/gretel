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
            nvFontSize: 12,
            fsFontSize: 14,
            sentence: "",
            initFSOnClick: false,
            extendedPOS: false,
            pathToHTML: ''
        };
        var args = $.extend({}, defaults, options);
        var instance = this,
            FS, NS,
            treeFS, treeNS, tooltipFS, tooltipNS,
            anyTree,
            anyTooltip,
            zoomOpts,
            sentenceContainer,
            fontFitSize, tooltipTimeout;
        var $window = $(window),
          $body = $("body");

        initVars();
        loadXML(xml);

        if (!args.initFSOnClick) {
            // Show tree-visualizer-fs tree
            instance.find(".tv-show-fs").click(function(e) {
                anyTooltip.css("top", "-100%").children("ul").empty();
                if (typeof treeNS != "undefined") treeNS.find("a").removeClass("hovered");
                $body.addClass("tv-fs-open");
                FS.fadeIn(250, function() {
                    fontFitSize = null;
                    fontToFit();
                });

                e.preventDefault();
            });
        }
        // Adjust scroll position
        anyTree.add($window).scroll(function() {
            tooltipPosition();
        });

        // Close fullscreen if a user clicks on an empty area
        FS.click(function(e) {
            var target = $(e.target);
            if (!target.tv-closest(".tv-error, .tv-tree, .tv-tooltip, .tv-zoom-wrapper, .tv-sentence").length) {
                $body.removeClass("tv-fs-open");
                FS.fadeOut(250, function() {
                    treeFS.find("a").removeClass("hovered");
                    removeError();
                });
                if (args.initFSOnClick) history.replaceState("", document.title, window.location.pathname + window.location.search);
            }
        });
        // Zooming
        zoomOpts.find("button").click(function() {
            var $this = $(this);
            if ($this.is(".tv-close")) {
                FS.fadeOut(250, function() {
                    treeFS.find("a").removeClass("hovered");
                    removeError();
                });
                if (args.initFSOnClick) history.replaceState("", document.title, window.location.pathname + window.location.search);
            } else {
                clearTimeout(tooltipTimeout);
                fontSizeTreeFS($this.attr("class").match(/\b(zoom-[^\s]+)\b/)[0]);
                sizeTreeFS();

                var animationSpeed = treeFS.find("a.hovered").css("transition-duration") || 200;
                animationSpeed = (String(animationSpeed).indexOf("ms") > -1) ? parseFloat(animationSpeed) : (parseFloat(animationSpeed) * 1000);
                animationSpeed += 50;

                tooltipTimeout = setTimeout(function() {
                    tooltipPosition(true);
                }, animationSpeed);
            }
        });

        // Make the tree-visualizer-fs tree responsive
        $window.on("resize", $.debounce(250, function() {
            if (treeFS.is(":visible")) {
                sizeTreeFS();
            }
        }));


        anyTree.on("click", "a", function(e) {
            if (!$(this).hasClass("ignored")) {
                var $this = $(this),
                    data = $this.parent("li").data(),
                    tree = $this.tv-closest(".tv-tree"),
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
            if ($(this).tv-closest(".tv-tree").hasClass("small")) {
                $(this).on("transitionend", function() {
                    tooltipPosition(true);
                });
            }
        });

        anyTooltip.find("button").click(function() {
            var tooltip = $(this).parent(".tv-tooltip");

            tooltip.fadeOut(250);
            tooltip.prev(".tv-tree").find("a").removeClass("hovered");
        });

        function initVars() {
            var trees = [],
                tooltips = [],
                views = [];

            if (args.normalView) {
                NS = instance.children("#tree-visualizer");

                treeNS = NS.find(".tv-tree");
                treeNS.css("fontSize", args.nvFontSize);
                tooltipNS = treeNS.children(".tv-tooltip");

                views.push(NS);
                trees.push(treeNS);
                tooltips.push(tooltipNS);
            }

            FS = instance.children("#tree-visualizer-fs");

            treeFS = FS.find(".tv-tree");
            treeFS.css("fontSize", args.fsFontSize);
            treeFS.find(".tv-zoom-wrapper > a").attr('href', xml);
            tooltipFS = treeFS.children(".tv-tooltip");
            zoomOpts = FS.find(".tv-zoom-opts");

            views.push(FS);
            trees.push(treeFS);
            tooltips.push(tooltipFS);

            if (args.sentence != "") {
                treeFS.find(".tv-sentence-wrapper").addClass("has-sentence").children("span").text(decodeURI(args.sentence));
            }


            anyTree = jqArrayToJqObject(trees);
            anyTooltip = jqArrayToJqObject(tooltips);
            anyView = jqArrayToJqObject(views);

            errorContainer = anyView.children(".tv-error");
        }

        function loadXML(src) {
            $body.removeClass("tv-active, tv-success, tv-fail");
            $.ajax({
                    type: "GET",
                    url: src,
                    dataType: "xml",
                    cache: false
                })
                .done(function(data) {
                    $body.addClass("tv-success");
                    if (data == null) {
                        errorHandle("Your XML appears to be empty or not in a compatible format.");
                    } else {
                        parseXMLObj(data);
                    }
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    $body.addClass("tv-fail");
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
                    if (args.normalView) {
                        $body.addClass("tv-active");
                    }
                    if (args.initFSOnClick) {
                        $(".loading-wrapper.tv").removeClass("active");
                        FS.fadeIn(250, function() {
                            fontFitSize = null;
                            fontToFit();
                        });
                    }
                });
        }

        function parseXMLObj(xml) {
            var xmlObject = $(xml);

            removeError();

            // See the buildOutputList function below
            anyTree.prepend(buildOutputList(xmlObject.find("node").first()));

            // Empty tooltips
            anyTooltip.children("ul").empty();

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
            var currentFontSize = parseInt(treeFS.css("fontSize"), 10);
            if (currentFontSize <= 4) {
                zoomOpts.find("button.zoom-out").prop("disabled", true);
                treeFS.css("fontSize", "4px");
            } else if (currentFontSize >= 20) {
                zoomOpts.find("button.zoom-in").prop("disabled", true);
            } else {
                zoomOpts.find("button").prop("disabled", false);
                treeFS.removeClass("small x-small");
            }

            if (currentFontSize <= 8) {
                treeFS.addClass("small");
                if (currentFontSize <= 4) {
                    treeFS.addClass("x-small");
                }
            }
        }

        function fontSizeTreeFS(mode) {
            if (mode == 'zoom-default') {
                var activeItem = instance.find(".tv-fs-toggled");

                if (activeItem.length && activeItem.data("tv-fontsize") > 0) {
                    treeFS.css("fontSize", activeItem.data("tv-fontsize") + "px");
                } else {
                    fontFitSize = null;
                    fontToFit();
                }
            } else {
                var currentFontSize = parseInt(treeFS.css("fontSize"), 10);
                if (mode == 'zoom-in') {
                    treeFS.css("fontSize", currentFontSize + 2 + "px");
                } else if (mode == 'zoom-out') {
                    treeFS.css("fontSize", currentFontSize - 2 + "px");
                }
            }
            noMoreZooming();
        }

        function fontToFit() {
            sizeTreeFS();
            var currentFontSize = parseInt(treeFS.css("fontSize"), 10),
                el = treeFS[0];

            if (((el.scrollHeight > treeFS.outerHeight()) || (el.scrollWidth > treeFS.outerWidth()))
                && (currentFontSize > 4)) {
                if (fontFitSize == null) fontFitSize = "large";
                treeFS.css("fontSize", currentFontSize - 1 + "px");
                sizeTreeFS();
                if (fontFitSize == "large") {
                    fontToFit();
                }
            } else if (fontFitSize != "large") {
                if (fontFitSize == null) fontFitSize = "small";
                treeFS.css("fontSize", currentFontSize + 1 + "px");
                sizeTreeFS();
                fontToFit();
            }

            instance.find(".tv-fs-toggled").attr("data-tv-fontsize", parseInt(treeFS.css("fontSize"), 10));
            noMoreZooming();
        }

        function tooltipPosition(animate) {
            var tree;
            if (typeof treeFS != "undefined" && treeFS.is(":visible")) {
                tree = treeFS;
            } else if (typeof treeNS != "undefined" && treeNS.is(":visible")) {
                tree = treeNS;
            }
            if (typeof tree != "undefined") {
                var targetLink = tree.find("a.hovered");
                if (targetLink.length) {
                    var tooltip = tree.next(".tv-tooltip"),
                        targetRect = targetLink[0].getBoundingClientRect(),
                        treeRect = tree[0].getBoundingClientRect(),
                        linkV = {
                            top: targetRect.top,
                            right: targetRect.left + treeRect.width,
                            bottom: targetRect.top + treeRect.height,
                            left: targetRect.left,
                            w: targetRect.width,
                            h: targetRect.height
                        },
                        treeV = {
                            top: treeRect.top,
                            right: treeRect.left + treeRect.width,
                            bottom: treeRect.top + treeRect.height,
                            left: treeRect.left,
                            w: treeRect.width,
                            h: treeRect.height
                        };
                    if (animate) {
                        tooltip.stop(true).animate({
                            "left": parseInt(linkV.left + (linkV.w / 2) - (tooltip.outerWidth() / 2) + 7.5, 10),
                            "top": parseInt(linkV.top - tooltip.outerHeight() - 24, 10)
                        }, 250);
                    } else {
                        tooltip.css({
                            "left": parseInt(linkV.left + (linkV.w / 2) - (tooltip.outerWidth() / 2) + 7.5, 10),
                            "top": parseInt(linkV.top - tooltip.outerHeight() - 24, 10)
                        });
                    }


                    if (((linkV.left + (linkV.w / 2)) < treeV.left) ||
                        ((linkV.right + (linkV.w / 2)) < treeV.right) ||
                        ((linkV.top + (linkV.h / 2)) < treeV.top) ||
                        ((linkV.bottom + linkV.h) < treeV.bottom)) {
                        tooltip.fadeOut(400);
                    } else {
                        tooltip.fadeIn(250);
                    }
                }
            }
        }

        function sizeTreeFS() {
            var rect = treeFS.children("ol")[0].getBoundingClientRect();

            treeFS.css({
                "width": rect.width + FSTreePadding.right + FSTreePadding.left,
                "height": rect.height + FSTreePadding.top + FSTreePadding.bottom,
                "max-width": $window.width() - FSPadding.right - FSPadding.left,
                "max-height": $window.height() - FSPadding.top - FSPadding.bottom
            });

            if (args.tv-sentence != "") {
                treeFS.css("max-height", $window.height() - FSPadding.top - FSPadding.bottom - (sentenceContainer[0].getBoundingClientRect().height * 2));
                sentenceContainer.css("max-width", treeFS[0].getBoundingClientRect().width);
            }
        }

        function errorHandle(message) {
            errorContainer.children("p").html(message).parent().fadeIn(250);
            if (args.normalView) {
                treeNS.hide();
                NS.children(".tv-show-fs").prop("disabled", true).hide();
            }

            treeFS.hide();
        }

        function removeError() {
            errorContainer.hide();
            treeFS.show();
            if (args.normalView) {
                NS.children(".tv-show-fs").prop("disabled", false).show();
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
