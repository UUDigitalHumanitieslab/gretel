import { SearchResult } from './search-service';
import * as $ from 'jquery';
type NodeProperties = {
    pos: string,
    lemma: string
};

type Row = {
    metadataValues: { [name: string]: string },
    nodeCount: number,
    /**
     * Get the node properties, using their 1-based position.
     */
    nodeProperties: { [position: number]: NodeProperties },
    nodeVariableValues: { [name: string]: NodeProperties }
};

export class AnalysisService {
    private getRow(variables: string[], metadataKeys: string[], result: SearchResult, placeholder: string): Row {
        let nodes = $($.parseXML(result.nodeXml)).find('node[lemma]');
        let metadataValues: { [name: string]: string } = {};
        for (let key of metadataKeys) {
            metadataValues[key] = result.metadata[key];
        }

        let nodeProperties: { [position: number]: NodeProperties } = {};
        nodes.each((index, node) => {
            let $node = $(node);
            let pos = $node.attr('pos');
            let lemma = $node.attr('lemma');
            nodeProperties[index + 1] = {
                pos: pos ? pos : placeholder,
                lemma: lemma ? lemma : placeholder
            };
        });

        let nodeVariableValues: { [name: string]: NodeProperties } = {};
        for (let variable of variables) {
            let value = result.variables[variable];
            nodeVariableValues[variable] = {
                pos: value && value.pos ? value.pos : placeholder,
                lemma: value && value.lemma ? value.lemma : placeholder
            };
        }

        return { metadataValues, nodeCount: nodes.length, nodeProperties, nodeVariableValues };
    }

    /**
     * Get a flat table representation of the search results.
     * @param searchResults The results to parse.
     * @param variables The variables to return, which should be present in the results.
     * @param metadataKeys The metadata keys to return, which should be present in the results.
     * @param placeholder If a value is missing for a column, this value is used instead.
     * @returns The first row contains the column names, the preceding the associated values.
     */
    public getFlatTable(searchResults: SearchResult[], variables: string[], metadataKeys: string[], placeholder = '(none)'): string[][] {
        let rows: Row[] = [];
        let maxNodeCount = 0;

        for (let result of searchResults) {
            let row = this.getRow(variables, metadataKeys, result, placeholder);
            rows.push(row);

            if (row.nodeCount > maxNodeCount) {
                maxNodeCount = row.nodeCount;
            }
        }

        let columnNames: string[] = [];
        columnNames.push(...metadataKeys);

        // show 1-based positions, because they are a bit more human-friendly
        let nodePositions = Array.apply(null, { length: maxNodeCount }).map((_, index) => index + 1);

        columnNames.push(...nodePositions.map(i => `pos${i}`));
        columnNames.push(...nodePositions.map(i => `lem${i}`));

        // remove the starting $ variable identifier
        columnNames.push(...variables.map(name => `pos_${name.slice(1)}`));
        columnNames.push(...variables.map(name => `lem_${name.slice(1)}`));

        // first row contains the column names
        let results = [columnNames];

        for (let row of rows) {
            let line: string[] = [];

            line.push(...metadataKeys.map(key => row.metadataValues[key] ? row.metadataValues[key] : placeholder));
            line.push(...nodePositions.map(i => row.nodeProperties[i] ? row.nodeProperties[i].pos : placeholder));
            line.push(...nodePositions.map(i => row.nodeProperties[i] ? row.nodeProperties[i].lemma : placeholder));
            line.push(...variables.map(name => row.nodeVariableValues[name] ? row.nodeVariableValues[name].pos : placeholder));
            line.push(...variables.map(name => row.nodeVariableValues[name] ? row.nodeVariableValues[name].lemma : placeholder));

            results.push(line);
        };

        return results;
    }
}