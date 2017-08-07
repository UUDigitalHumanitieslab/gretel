import { PathVariable } from '../xpath-extractinator';
export class SearchService {
    public getAllResults(variables: PathVariable[]) {
        // TODO: read URL from config
        return new Promise<SearchResult[]>((resolve, reject) => {
            $.ajax('basex-search-scripts/get-all-results.php', {
                data: { variables },
                method: 'post'
            }).done((json) => {
                var data = $.parseJSON(json);
                if (!data.error) {
                    if (!data.data) {
                        return resolve([]);
                    }

                    return resolve(this.parseData(data.data));
                } else {
                    return reject(data.error);
                }
            });
        });
    }

    private parseData(data: { [sentenceId: string]: string[] }): SearchResult[] {
        let result: SearchResult[] = [];
        for (let sentenceId in data) {
            let [link, highlightedSentence, componentName, metadata, nodeXml, variablesXml] = data[sentenceId];

            // TODO: just get values from server instead of parsing HTML
            result.push({
                sentenceId,
                viewUrl: $(link).attr('href'),
                fileName: $(link).text(),
                highlightedSentence,
                componentName,
                metadata: this.parseMetadata(metadata),
                nodeXml,
                variables: this.parseVariables(variablesXml)
            });
        };

        return result;
    }

    private parseMetadata(xml: string): Metadata {
        var tree = $($.parseXML("<metadata>" + xml + "</metadata>"));
        var result: Metadata = {};

        tree.find('meta').each((index, item) => {
            result[$(item).attr('name')] = $(item).attr('value');
        });
        return result;
    }

    private parseVariables(xml: string): Variables {
        var vars = $($.parseXML(xml)).find('var');
        let result: Variables = {};

        vars.each((index, variable) => {
            let $variable = $(variable);
            result[$variable.attr('name')] = {
                pos: $variable.attr('pos'),
                lemma: $variable.attr('lemma')
            };
        });
        return result;
    }
}

export interface SearchResult {
    sentenceId: string,
    viewUrl: string,
    fileName: string,
    highlightedSentence: string,
    componentName: string,
    metadata: Metadata,
    nodeXml: string,
    variables: Variables
}

type Variables = { [name: string]: { pos: string, lemma: string } };
type Metadata = { [name: string]: string };
