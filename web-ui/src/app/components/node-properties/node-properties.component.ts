import { Component, EventEmitter, OnDestroy, Output, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExtractinatorService } from 'lassy-xpath';

import { StateService, SearchVariable } from '../../services/_index';
import { GlobalState } from '../../pages/multi-step-page/steps';
import { AddNodeEvent } from './node-properties-editor.component';

@Component({
    selector: 'grt-node-properties',
    templateUrl: './node-properties.component.html',
    styleUrls: ['./node-properties.component.scss']
})
export class NodePropertiesComponent implements OnDestroy {
    private subscriptions: Subscription[];
    private xpath: string;

    @Input()
    nodeName: string;

    @Output()
    add = new EventEmitter<AddNodeEvent>();

    nodes: SearchVariable[] = [];

    constructor(
        private stateService: StateService<GlobalState>,
        private extractinatorService: ExtractinatorService) {
        this.subscriptions = [
            this.stateService.state$.subscribe(state => {
                this.setXpath(state.xpath);
                this.setVariables(state.variableProperties);
            })
        ];
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

    update(nodes: SearchVariable[]) {
        this.stateService.setState({
            variableProperties: this.getVariableProperties(nodes)
        });
    }

    /**
     * Extracts the available variables from the xpath query,
     * preserves the custom properties
     * @param xpath the (updated) xpath
     */
    private setXpath(xpath: string) {
        if (this.xpath === xpath) {
            return;
        }
        this.xpath = xpath;
        this.nodes = this.extractinatorService.extract(xpath).map(
            variable => {
                const current = this.nodes.find(x => x.name === variable.name);
                return {
                    name: variable.name,
                    path: variable.path,
                    props: current ? current.props : undefined
                };
            });
    }

    private setVariables(props: GlobalState['variableProperties']) {
        const propLookup: { [varName: string]: SearchVariable['props'] } = {};
        if (props) {
            for (const prop of props) {
                if (!(prop.variableName in propLookup)) {
                    propLookup[prop.variableName] = [];
                }
                propLookup[prop.variableName].push({
                    name: prop.propertyName,
                    expression: prop.propertyExpression,
                    enabled: prop.enabled
                });
            }
        }
        this.nodes = this.nodes.map(({ name, path }) => ({
            name,
            path,
            props: propLookup[name]
        }));
    }

    private getVariableProperties(nodes: SearchVariable[]) {
        const result: GlobalState['variableProperties'] = [];
        for (const node of nodes) {
            if (node.props) {
                result.push(...node.props.map(({ name, expression, enabled }) => ({
                    variableName: node.name,
                    propertyName: name,
                    propertyExpression: expression,
                    enabled
                })));
            }
        }

        return result;
    }
}
