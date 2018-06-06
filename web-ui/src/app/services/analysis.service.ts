import { Injectable } from '@angular/core';

import { XpathAttributes } from 'lassy-xpath/ng';
import * as _ from 'lodash';

import { Hit } from './results.service';

@Injectable()
export class AnalysisService {
    private getRow(variables: { [name: string]: string[] }, metadataKeys: string[], result: Hit, placeholder: string): Row {
        let metadataValues: { [name: string]: string } = {};
        for (let key of metadataKeys) {
            metadataValues[key] = result.metaValues[key];
        }

        let nodeVariableValues: { [name: string]: NodeProperties } = {};
        for (let name of Object.keys(variables)) {
            let node = result.variableValues[name];
            let values: { [attribute: string]: string } = {};
            for (let attribute of variables[name]) {
                values[attribute] = node && node[attribute] ? node[attribute] : placeholder;
            };
            nodeVariableValues[name] = values;
        }

        return { metadataValues, nodeVariableValues };
    }

    /**
     * Gets the attributes found in the hits for a path variable.
     * @param variableName Name of the path variable.
     * @param hits The results to search.
     */
    public getVariableAttributes(variableName: string, hits: Hit[]) {
        let availableAttrs: { [key: string]: true } = {};
        for (let hit of hits) {
            let values = Object.keys(hit.variableValues[variableName]).filter(a => a != 'name');
            for (let value of values) {
                availableAttrs[value] = true;
            }
        };

        return _.sortBy(Object.keys(availableAttrs)).map((attr) => {
            let description = XpathAttributes[attr].description;
            return {
                value: attr,
                label: description ? `${attr} (${description})` : attr
            }
        });
    }

    /**
     * Get a flat table representation of the search results.
     * @param searchResults The results to parse.
     * @param variables The variables and their properties to return, which should be present in the results.
     * @param metadataKeys The metadata keys to return, which should be present in the results.
     * @param placeholder If a value is missing for a column, this value is used instead.
     * @returns The first row contains the column names, the preceding the associated values.
     */
    public getFlatTable(searchResults: Hit[], variables: { [name: string]: string[] }, metadataKeys: string[], placeholder = '(none)'): string[][] {
        let rows: Row[] = [];

        for (let result of searchResults) {
            let row = this.getRow(variables, metadataKeys, result, placeholder);
            rows.push(row);
        }

        let columnNames: string[] = [];
        columnNames.push(...metadataKeys);

        // remove the starting $ variable identifier
        for (let name of Object.keys(variables)) {
            columnNames.push(...variables[name].map(attr => `${name}.${attr}`));
        }

        // first row contains the column names
        let results = [columnNames];

        for (let row of rows) {
            let line: string[] = [];

            line.push(...metadataKeys.map(key => row.metadataValues[key] ? row.metadataValues[key] : placeholder));
            for (let name of Object.keys(variables)) {
                line.push(...variables[name].map(attr => row.nodeVariableValues[name][attr]));
            }

            results.push(line);
        };

        return results;
    }
}

export type NodeProperties = {
    [property: string]: string
};

export type Row = {
    metadataValues: { [name: string]: string },
    nodeVariableValues: { [name: string]: NodeProperties }
};
