import { Injectable } from '@angular/core';

import { XPathAttributes } from 'lassy-xpath/ng';
import * as _ from 'lodash';

import { Hit } from './results.service';

@Injectable()
export class AnalysisService {
    /**
     * If a value is missing for a column, this value is used instead.
     */
    public static placeholder = '(none)';

    private getRow(variables: { [name: string]: string[] }, metadataKeys: string[], result: Hit): Row {
        const metadataValues: { [name: string]: string } = {};
        for (const key of metadataKeys) {
            metadataValues[key] = result.metaValues[key];
        }

        const nodeVariableValues: { [name: string]: NodeProperties } = {};
        for (const name of Object.keys(variables)) {
            const node = result.variableValues[name];
            const values: { [attribute: string]: string } = {};
            for (const attribute of variables[name]) {
                values[attribute] = node && node[attribute] || AnalysisService.placeholder;
            }
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
        const availableAttrs: { [key: string]: true } = {};
        for (const hit of hits) {
            const values = Object.keys(hit.variableValues[variableName]).filter(a => a !== 'name');
            for (const value of values) {
                availableAttrs[value] = true;
            }
        }

        return _.sortBy(Object.keys(availableAttrs)).map((attr) => {
            const description = XPathAttributes[attr].description;
            return {
                value: attr,
                label: description ? `${attr} (${description})` : attr
            };
        });
    }

    /**
     * Get a flat table representation of the search results.
     * @param searchResults The results to parse.
     * @param variables The variables and their properties to return, which should be present in the results.
     * @param metadataKeys The metadata keys to return, which should be present in the results.
     * @returns The first row contains the column names, the preceding the associated values.
     */
    public getFlatTable(searchResults: Hit[], variables: { [name: string]: string[] }, metadataKeys: string[]): string[][] {
        const rows: Row[] = [];

        for (const result of searchResults) {
            const row = this.getRow(variables, metadataKeys, result);
            rows.push(row);
        }

        const columnNames: string[] = [];
        columnNames.push(...metadataKeys);

        // remove the starting $ variable identifier
        for (const name of Object.keys(variables)) {
            columnNames.push(...variables[name].map(attr => `${name}.${attr}`));
        }

        // first row contains the column names
        const results = [columnNames];

        for (const row of rows) {
            const line: string[] = [];

            line.push(...metadataKeys.map(key => row.metadataValues[key] || AnalysisService.placeholder));
            for (const name of Object.keys(variables)) {
                line.push(...variables[name].map(attr => row.nodeVariableValues[name][attr]));
            }

            results.push(line);
        }

        return results;
    }
}

export interface NodeProperties {
    [property: string]: string;
}

export interface Row {
    metadataValues: { [name: string]: string };
    nodeVariableValues: { [name: string]: NodeProperties };
}
