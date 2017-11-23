import { SearchResult } from './search-service';
import * as $ from 'jquery';
type NodeProperties = {
    pos: string,
    lemma: string
};

type Row = {
    metadataValues: { [name: string]: string },
    nodeVariableValues: { [name: string]: NodeProperties }
};

export class AnalysisService {
    private getRow(variables: string[], metadataKeys: string[], result: SearchResult, placeholder: string): Row {
        let metadataValues: { [name: string]: string } = {};
        for (let key of metadataKeys) {
            metadataValues[key] = result.metadata[key];
        }
        
        let nodeVariableValues: { [name: string]: NodeProperties } = {};
        for (let variable of variables) {
            let value = result.variables[variable];
            nodeVariableValues[variable] = {
                pos: value && value.pos ? value.pos : placeholder,
                lemma: value && value.lemma ? value.lemma : placeholder
            };
        }

        return { metadataValues, nodeVariableValues };
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

        for (let result of searchResults) {
            let row = this.getRow(variables, metadataKeys, result, placeholder);
            rows.push(row);
        }

        let columnNames: string[] = [];
        columnNames.push(...metadataKeys);

        // remove the starting $ variable identifier
        columnNames.push(...variables.map(name => `pos_${name.slice(1)}`));
        columnNames.push(...variables.map(name => `lem_${name.slice(1)}`));

        // first row contains the column names
        let results = [columnNames];

        for (let row of rows) {
            let line: string[] = [];

            line.push(...metadataKeys.map(key => row.metadataValues[key] ? row.metadataValues[key] : placeholder));
            line.push(...variables.map(name => row.nodeVariableValues[name] ? row.nodeVariableValues[name].pos : placeholder));
            line.push(...variables.map(name => row.nodeVariableValues[name] ? row.nodeVariableValues[name].lemma : placeholder));

            results.push(line);
        };

        return results;
    }
}