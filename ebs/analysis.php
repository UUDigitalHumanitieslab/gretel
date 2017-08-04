<?php
session_cache_limiter('private');
session_start();
header('Content-Type:text/html; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$currentPage = 'ebs';
$step = 7;

require "../config.php";
require ROOT_PATH . "/helpers.php";

require ROOT_PATH . "/front-end-includes/metadata.php";
retrieve_metadata();

$_SESSION['ebsxps'] = $currentPage;
$id = session_id();

$continueConstraints = sessionVariablesSet(array('treebank', 'queryid', 'example', 'subtreebank', 'xpath'));

if ($continueConstraints) {
    require ROOT_PATH . "/preparatory-scripts/prep-functions.php";

    $treeVisualizer = true;
    $onlyFullscreenTv = true;
    $corpus = $_SESSION['treebank'];
    $components = $_SESSION['subtreebank'];
    $xpath = $_SESSION['originalXp'] . get_metadata_filter();
    $originalXp = $_SESSION['originalXp'];

    // Need to clean in case the user goes back in history, otherwise the
    // prepended slashes below would keep stacking on each back-and-forward
    // in history
    $xpath = cleanXpath($xpath);
    $originalXp = cleanXpath($originalXp);
    $example = $_SESSION['example'];

    $context = $_SESSION['ct'];
    $_SESSION['endPosIteration'] = 0;
    $_SESSION['startDatabases'] = array();
    if ($corpus == 'sonar') {
        $databaseExists = false;
    }

    $needRegularSonar = false;
}

session_write_close();

require ROOT_PATH . "/functions.php";
require ROOT_PATH . "/front-end-includes/head.php";

if ($continueConstraints) {
    require ROOT_PATH . "/basex-search-scripts/treebank-search.php";
    require ROOT_PATH . "/basex-search-scripts/basex-client.php";
    session_start();
    if ($corpus == 'sonar') {
        $bf = xpathToBreadthFirst($xpath);
        // Get correct databases to start search with, sets to
        // $_SESSION['startDatabases']
        checkBfPattern($bf);

        // When looking in the regular version we need the double slash to go through
        // all descendants
        if ($needRegularSonar) {
            $xpath = "//$xpath";
            $originalXp = "//$originalXp";
        } else {
            $xpath = "/$xpath";
            $originalXp = "/$originalXp";
        }
    } else {
        $xpath = "//$xpath";
        $originalXp = "//$originalXp";
        $_SESSION['startDatabases'] = corpusToDatabase($components, $corpus);
    }

    session_write_close();
}
?>

<?php flush(); ?>
<?php
require ROOT_PATH . "/front-end-includes/header.php";
?>
<div id="output"></div>
<?php
if ($continueConstraints) {
    setContinueNavigation();
}
require ROOT_PATH . "/front-end-includes/footer.php";
include ROOT_PATH . "/front-end-includes/analytics-tracking.php";
?>

<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/pivottable/2.11.0/pivot.min.css">
<script src="//cdnjs.cloudflare.com/ajax/libs/pivottable/2.11.0/pivot.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/pivottable/2.6.0/tips_data.min.js"></script>

<script>
    var API = '<?= API_URL; ?>';
    var CORPUS = '<?= $corpus; ?>';
</script>
<div id="xpath-variables">
<?php
if (isset($_POST["xpath-variables"])) {
    $variables = $_POST["xpath-variables"];
    foreach ($variables as $index => $value) {
        $name = htmlspecialchars($value['name']);
        $path = htmlspecialchars($value['path']);
        ?><span class="path-variable" data-name="<?= $name ?>" data-path="<?= $path ?>"></span><?php
    }
}
?>
</div>
<script>
    $(function () {
        var variables = $.makeArray($('#xpath-variables .path-variable').map(function(n, element) {
            return $(element).data();
        }));
        var utils = $.pivotUtilities;
        var heatmap = utils.renderers["Heatmap"];

        var metadata_fields = [];
        $.get(API + '/treebank/metadata/' + CORPUS, function (data) {
            $.each(data, function (i, value) {
                metadata_fields.push(value.field);
            });
        }).done(function () {
            $.ajax('basex-search-scripts/get-all-results.php', { 
                    data: { variables },
                    method: 'post'
                }).done(function (json) {
                        var data = $.parseJSON(json);
                        if (!data.error && data.data) {
                            // for each match: the metadata, the POS-tags and lemmata
                            var m_list = [];
                            var pos_list = []; 
                            var lemmata_list = [];
                            var pos_by_var_list = [];
                            var lemmata_by_var_list = [];

                            // iterate through the found matches
                            $.each(data.data, function (i, value) {
                                // TODO: instead of parsing XML (metadata + nodes), this could probably be done
                                // more efficiently with a simple regex. We're not interested in this structure anyway.
                                var metadata = $($.parseXML("<metadata>" + value[3] + "</metadata>"));
                                var mv = [];
                                var m = {};
                                $.each(metadata.find('meta'), function (j, v) {
                                    m[$(v).attr('name')] = $(v).attr('value');
                                });
                                $.each(metadata_fields, function (j, v) {
                                    mv.push(m[v]);
                                });
                                m_list.push(mv);

                                var nodes = $($.parseXML(value[4]));
                                var lemmata = [];
                                var pos = [];
                                $.each(nodes.find('node'), function (j, v) {
                                    var attr = $(v).attr('pos');
                                    if (attr) {
                                        pos.push(attr);
                                    }

                                    var attr = $(v).attr('lemma');
                                    if (attr) {
                                        lemmata.push(attr);
                                    }
                                });

                                
                                var vars = $($.parseXML(value[5])).find('var');
                                var pos_by_var = [], lemmata_by_var = [];
                                vars.each(function(n, el) {
                                    var $var = $(el);
                                    pos_by_var.push($var.attr('pos'));
                                    lemmata_by_var.push($var.attr('lemma'));
                                });

                                pos_list.push(pos);
                                lemmata_list.push(lemmata);
                                pos_by_var_list.push(pos_by_var);
                                lemmata_by_var_list.push(lemmata_by_var);
                            });

                            // TODO: this could be done more efficient, either just max (O(n)) instead of sort
                            // or integrate this in the existing loop above.
                            var longest = pos_list.sort(function (a, b) {
                                return b.length - a.length;
                            })[0].length;

                            for (var i = 1; i <= longest; i++) {
                                metadata_fields.push('pos' + i);
                            }
                            for (var i = 1; i <= longest; i++) {
                                metadata_fields.push('lem' + i);
                            }

                            for (let i in variables) {
                                var variable = variables[i];
                                var name = variable.name.replace('$', '');
                                metadata_fields.push(`pos_${name}`);
                            }

                            for (let i in variables) {
                                var variable = variables[i];
                                var name = variable.name.replace('$', '');
                                metadata_fields.push(`lem_${name}`);
                            }

                            var pivotData = [metadata_fields];

                            $.each(m_list, function (i, m) {
                                var line = [];

                                line.push.apply(line, m_list[i]);
                                // TODO: instead of first expanding the pos_list and then appending
                                // that list to the result list. Directly expand the result list.
                                var p = pos_list[i];
                                while (p.length < longest) {
                                    p.push('(none)');
                                }
                                line.push.apply(line, pos_list[i]);
                                var l = lemmata_list[i];
                                while (l.length < longest) {
                                    l.push('(none)');
                                }
                                line.push.apply(line, lemmata_list[i]);
                                line.push.apply(line, pos_by_var_list[i]);
                                line.push.apply(line, lemmata_by_var_list[i]);

                                pivotData.push(line);
                            });


                            $("#output").pivotUI(
                                    pivotData, {
                                        rows: [],
                                        cols: [],
                                        renderer: heatmap
                                    });
                        } else {
                            /* $(".loading-wrapper.searching").removeClass("active");
                             messages.children("div").removeClass("error notice").closest(".results-messages-wrapper").show();
                             downloadWrapper.addClass("active");
                             if (data.error) {
                             messageOnError(data.data);
                             } else if (resultsWrapper.find("tbody:not(.empty)").children().length == 0) {
                             messageNoResultsFound();
                             }*/
                        }
                    })
                    .fail(function (jqXHR, textStatus, error) {
                        // Edge triggers a fail when an XHR request is aborted
                        // We don't want that, so if the error message is abort, ignore
                        if (error != 'abort') {
                            var string = "An error occurred: " + error + ".";
                            messageOnError(string);
                        }
                    })
                    .always(function () {
                        done = true;
                        //if (xhrFetchSentences)
                        //xhrFetchSentences.abort();
                    });
        });
    });
</script>

</body>
</html>
